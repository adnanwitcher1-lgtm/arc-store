import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import Field from "../components/common/Field";
import PageFade from "../components/common/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      showToast("Welcome back");
      navigate("/");
    } catch {
      showToast("Incorrect username or password", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageFade>
      <Container className="flex justify-center py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-stone">
            New here? <Link to="/register" className="font-medium text-pine">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Username" value={username} onChange={setUsername} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 rounded-xl bg-paper-dim/60 p-4 text-xs text-stone">
            Demo account: username <span className="font-medium text-ink">sara.k</span>, password{" "}
            <span className="font-medium text-ink">DemoPass123!</span>
          </p>
        </div>
      </Container>
    </PageFade>
  );
}
