import Stripe from "stripe"

// Initialize Stripe with your production-ready key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not set in environment variables.")
}

export default stripe

// Payment processing functions ready for implementation
export async function createPaymentIntent(amount, currency = "usd", productInfo = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        product_name: productInfo.name || "",
        product_id: productInfo.id || "",
        customer_email: productInfo.customer_email || "",
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function createCustomer(email, name, phone = "") {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        source: "stanley_srl_website",
      },
    })

    return customer
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function createProduct(productData) {
  try {
    const product = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      images: productData.image ? [productData.image] : [],
      metadata: {
        category: productData.category,
        featured: productData.featured.toString(),
        stanley_product_id: productData.id,
      },
    })

    return product
  } catch (error) {
    console.error("Error creating Stripe product:", error)
    throw error
  }
}
