package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/smtp"
	"strings"
)

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	FromEmail    string
}

type EmailSender struct {
	config *EmailConfig
}

func NewEmailSender(config *EmailConfig) *EmailSender {
	return &EmailSender{config: config}
}

func (s *EmailSender) HandleSendEmail(ctx context.Context, payload map[string]string) error {
	to := payload["to"]
	subject := payload["subject"]
	body := payload["body"]

	if to == "" || subject == "" {
		return fmt.Errorf("to and subject are required")
	}

	if body == "" {
		body = subject
	}

	return s.sendEmail(to, subject, body)
}

func (s *EmailSender) sendEmail(to, subject, body string) error {
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		s.config.FromEmail, to, subject, body)

	addr := fmt.Sprintf("%s:%s", s.config.SMTPHost, s.config.SMTPPort)

	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPassword, s.config.SMTPHost)

	err := smtp.SendMail(addr, auth, s.config.FromEmail, []string{to}, []byte(msg))
	if err != nil {
		log.Printf("failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("email sent to %s: %s", to, subject)
	return nil
}

type ContactEmailPayload struct {
	ContactID string
	Name      string
	Phone     string
	Email     string
	Message   string
}

func (s *EmailSender) HandleContactNotification(ctx context.Context, taskPayload []byte) error {
	var payload ContactEmailPayload
	if err := json.Unmarshal(taskPayload, &payload); err != nil {
		return err
	}

	managerEmail := "manager@stairs.local"

	subject := fmt.Sprintf("New contact request from %s", payload.Name)
	body := fmt.Sprintf(`
New contact form submission:

Name: %s
Phone: %s
Email: %s
Message: %s

Contact ID: %s
`, payload.Name, payload.Phone, payload.Email, payload.Message, payload.ContactID)

	return s.sendEmail(managerEmail, subject, body)
}

func SplitAddress(addr string) (host, port string) {
	parts := strings.Split(addr, ":")
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return "localhost", "25"
}