import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";

import {
  bookSection,
  container,
  footer,
  h1,
  h2,
  main,
  text,
} from "../email-styles/standard-styles";
import type { DailyReadingLogEmailProps } from "../types";


export default function DailyReadingLogEmail({
  userName,
  lastBookRead,
  nextBook,
  readingStreak,
  encouragement,
}: DailyReadingLogEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your daily reading update 📚</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hi {userName}! 📚</Heading>

          <Text style={text}>
            <strong>Reading Streak:</strong> {readingStreak} days 🔥
          </Text>
          <Text style={text}>{encouragement}</Text>

          <Section style={bookSection}>
            <Heading as="h2" style={h2}>
              Your Next Book
            </Heading>
            <Text style={text}>
              <strong>{nextBook.title}</strong>
              <br />
              By {nextBook.author}
            </Text>
            <Text style={text}>
              <em>{nextBook.recommendation}</em>
            </Text>
          </Section>

          <Text style={footer}>Recently finished: {lastBookRead}</Text>
        </Container>
      </Body>
    </Html>
  );
}
