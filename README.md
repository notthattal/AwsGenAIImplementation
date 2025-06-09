# Text Generation API Documentation

## Overview

This API provides secure text generation using Amazon Bedrock. It filters user input using AWS Comprehend to detect inappropriate sentiment or personally identifiable information (PII) before sending to the model.

## POST `/generate`

### Description
Generates a response from Amazon Bedrock based on the user-provided prompt. Applies content filtering using AWS Comprehend to block prompts with negative sentiment or personally identifiable information (PII).

### Request

**Headers**
- `Content-Type: application/json`

**Body**
```json
{
  "prompt": "string"
}
```

### Responses

**200 OK**
```json
{
  "completion": "The generated Text From LLM"
}
```

**400 Bad Request**
```json
{
  "error": "prompt is required"
}
```

**403 Forbidden**
- Prompt flagged for inappropriate sentiment
```json
{
  "error": "Generated content flagged for inappropriate sentiment."
}
```

- Prompt contains PII
```json
{
  "error": "Personally identifiable information should not be passed to the llm."
}
```

**500 Internal Server Error**
```json
{
  "error": "Detailed error message"
}
```

# Security Measures

## Input Validation & Filtering

- **Sentiment Filtering**  
  Uses `comprehend.detect_sentiment` to reject prompts with negative sentiment.

- **PII Detection**  
  Uses `comprehend.detect_pii_entities` to block prompts containing personally identifiable information.

## IAM & Permissions

- AWS credentials are managed via IAM role attached to the Lambda.
- Users/Roles were scoped to only include the necessary permissions

## Error Handling

All errors are returned with meaningful messages and appropriate status codes to help frontend handle issues securely.

# Usage Monitoring

- Cloudwatch logs are recorded for every invocation of the lambda
- PII detection is monitored
- Prompt injection attempts are monitored
- Invocations, errors and lambda durations are also monitored