import { registerSchema } from "./zodSchemas";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const input = {
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const input = {
      name: "Test User",
      email: "not-an-email",
      password: "password123"
    };
    const result = registerSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

