import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Field from "../components/common/Field";
import PageFade from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", first_name: "", last_name: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      showToast("Account created — welcome!");
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && Object.values(data)[0];
      setError(Array.isArray(firstError) ? firstError[0] : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageFade>
      <Container className="flex justify-center py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-stone">
            Already shopping with us? <Link to="/login" className="font-medium text-pine">Log in</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} />
              <Field label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} />
            </div>
            <Field label="Username" value={form.username} onChange={(v) => update("username", v)} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} required />
            {error && <p className="text-sm text-brick">{error}</p>}
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>
      </Container>
    </PageFade>
  );
}
