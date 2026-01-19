import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  firstName?: string;
  email: string;
  appUrl?: string;
}

export const WelcomeEmail = ({ 
  firstName = "there", 
  email,
  appUrl = "http://localhost:5173" 
}: WelcomeEmailProps) => {
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

  return (
    <Html>
      <Head />
      <Preview>Welcome to our app! Let's get you started.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Welcome to Our App!</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {firstName},</Text>

            <Text style={paragraph}>
              We're excited to have you on board! Your account has been
              successfully created, and you're all set to explore everything we
              have to offer.
            </Text>

            <Text style={paragraph}>
              Here are a few things you can do to get started:
            </Text>

            <ul style={list}>
              <li style={listItem}>Complete your profile</li>
              <li style={listItem}>Explore the dashboard</li>
              <li style={listItem}>Connect with other users</li>
            </ul>

            <Section style={buttonContainer}>
              <Button style={button} href={process.env.APP_URL || "#"}>
                Get Started
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions or need help getting started, feel free
              to reach out to our support team. We're here to help!
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Best regards,
              <br />
              The Team
            </Text>

            <Text style={footerLinks}>
              <Link href="#" style={link}>
                Help Center
              </Link>
              {" · "}
              <Link href="#" style={link}>
                Contact Us
              </Link>
              {" · "}
              <Link href={unsubscribeUrl} style={link}>
                Unsubscribe
              </Link>
            </Text>

            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Our App. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 48px",
  textAlign: "center" as const,
  backgroundColor: "#5469d4",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "0 48px",
};

const greeting = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
  fontWeight: "600",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
};

const list = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "24px",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
};

const buttonContainer = {
  padding: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "5px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#6b7280",
  marginBottom: "16px",
};

const footerLinks = {
  fontSize: "14px",
  color: "#6b7280",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const link = {
  color: "#5469d4",
  textDecoration: "underline",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#9ca3af",
  marginTop: "16px",
  textAlign: "center" as const,
};
