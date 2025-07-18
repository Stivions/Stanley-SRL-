import { type NextRequest, NextResponse } from "next/server"
import { createPaymentIntent, createCustomer } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, productInfo, customerInfo } = await request.json()

    // Validate required fields
    if (!amount || !productInfo || !customerInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create customer in Stripe
    const customer = await createCustomer(customerInfo.email, customerInfo.name, customerInfo.phone)

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, {
      ...productInfo,
      customer_email: customerInfo.email,
      customer_id: customer.id,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    })
  } catch (error) {
    console.error("Payment intent creation failed:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
