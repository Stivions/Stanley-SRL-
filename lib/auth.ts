export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  // Secure admin authentication
  const validCredentials = [
    { email: "admin@stanley.com", password: "StanleySRL2024!" },
    { email: "stivion@stanley.com", password: "Dev2024Stanley!" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}
