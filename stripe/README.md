# stripe — Stripe payments for LOOK

A thin, honest Stripe wrapper built purely on the core `http::` and `json::` builtins:
form-encoded requests to the Stripe REST API with your secret key as a bearer token,
responses parsed as assoc. Amounts are in the smallest currency unit (cents / kuruş), so
it pairs naturally with the `money` module; verify inbound webhooks with the `webhook`
module (`webhook_verify_stripe`).

## Install

```bash
lk install github.com/codlook/look-packages/stripe
```

```lk
use "pkg/stripe"
```

## Use

```lk
use "pkg/stripe"

$sk = env("STRIPE_SECRET_KEY")

$pi = stripe_create_payment_intent($sk, 1999, "usd")   # 1999 = $19.99
# $pi["client_secret"] — hand to Stripe.js on the client

$cus = stripe_create_customer($sk, "buyer@example.com")

$session = stripe_create_checkout_session($sk, [
    "mode"                        => "payment",
    "success_url"                 => "https://shop.example.com/ok",
    "cancel_url"                  => "https://shop.example.com/cancel",
    "line_items[0][price]"        => "price_123",
    "line_items[0][quantity]"     => "1"
])
# $session["url"] — redirect the buyer there
```

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `stripe_create_payment_intent($sk, $amount, $currency)` | `assoc` | Create a PaymentIntent. |
| `stripe_create_customer($sk, $email)` | `assoc` | Create a customer. |
| `stripe_create_checkout_session($sk, $params)` | `assoc` | Create a Checkout Session. |
| `stripe_retrieve($sk, $path)` | `assoc` | GET any resource, e.g. `/v1/charges/ch_123`. |
| `stripe_request($sk, $method, $path, $params)` | `assoc` | Generic call for anything not wrapped above. |

## Notes

- Nested parameters use Stripe's bracket keys — e.g. `"line_items[0][price]" => "price_123"`.
- The API base is the `STRIPE_API_BASE` env var (default `https://api.stripe.com`), so
  you can point at a Stripe-compatible gateway or a local mock in tests.
- Verify webhook signatures with the `webhook` module before trusting an event; never
  fulfil an order from an unverified webhook body.
