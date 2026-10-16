---
title: "Synthetic access-token rotation plan"
type: feat
status: active
---

# Access-token rotation

## Goal

Rotate API access tokens once per year by adding a background job that updates
the database and sends each customer an email notification.

## Implementation units

1. Add a scheduled job that replaces every active token at midnight on January 1.
2. Send a single notification email after the replacement loop completes.

## Success criteria

- All active tokens are replaced.
- Customers receive one email notification.
