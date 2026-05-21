package tasks

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jung-kurt/gofpdf"
	"github.com/minio/minio-go/v7"
)

type PDFGenerator struct {
	pool   *pgxpool.Pool
	minio  *minio.Client
	bucket string
}

func NewPDFGenerator(pool *pgxpool.Pool, minioClient *minio.Client) *PDFGenerator {
	return &PDFGenerator{
		pool:   pool,
		minio:  minioClient,
		bucket: "stairs",
	}
}

func (g *PDFGenerator) HandleGeneratePDF(ctx context.Context, payload map[string]string) error {
	orderID := payload["orderId"]
	if orderID == "" {
		return fmt.Errorf("orderId is required")
	}

	var orderNumber, customerName, customerPhone string
	var totalPrice float64
	var configJSON []byte
	var createdAt time.Time

	err := g.pool.QueryRow(ctx, `
		SELECT order_number, customer_name, customer_phone, total_price, stair_config, created_at
		FROM orders WHERE id = $1
	`, orderID).Scan(&orderNumber, &customerName, &customerPhone, &totalPrice, &configJSON, &createdAt)

	if err != nil {
		return fmt.Errorf("failed to fetch order: %w", err)
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(190, 10, "Stairs Estimate")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(190, 7, fmt.Sprintf("Order: %s", orderNumber))
	pdf.Ln(7)
	pdf.Cell(190, 7, fmt.Sprintf("Date: %s", createdAt.Format("02.01.2006")))
	pdf.Ln(7)
	pdf.Cell(190, 7, fmt.Sprintf("Customer: %s", customerName))
	pdf.Ln(7)
	pdf.Cell(190, 7, fmt.Sprintf("Phone: %s", customerPhone))
	pdf.Ln(15)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(190, 8, "Configuration")
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 10)
	var config map[string]interface{}
	json.Unmarshal(configJSON, &config)
	for key, value := range config {
		pdf.Cell(190, 6, fmt.Sprintf("%s: %v", key, value))
		pdf.Ln(6)
	}
	pdf.Ln(10)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(190, 8, "Total Price")
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 10, fmt.Sprintf("%.2f RUB", totalPrice))

	var buf bytes.Buffer
	pdfErr := pdf.Output(&buf)
	if pdfErr != nil {
		return fmt.Errorf("failed to generate PDF: %w", pdfErr)
	}

	objectName := fmt.Sprintf("estimates/%s.pdf", orderNumber)
	_, err = g.minio.PutObject(ctx, g.bucket, objectName, bytes.NewReader(buf.Bytes()), int64(buf.Len()), minio.PutObjectOptions{
		ContentType: "application/pdf",
	})
	if err != nil {
		return fmt.Errorf("failed to upload PDF: %w", err)
	}

	pdfURL := fmt.Sprintf("http://localhost:9000/stairs/%s", objectName)

	_, err = g.pool.Exec(ctx, "UPDATE orders SET pdf_estimate_url = $1, updated_at = NOW() WHERE id = $2", pdfURL, orderID)
	if err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	log.Printf("PDF generated for order %s: %s", orderID, pdfURL)
	return nil
}