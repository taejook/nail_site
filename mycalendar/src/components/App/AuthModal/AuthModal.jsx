import { useState } from "react";
import { useModal } from "../../../context/ModalContext";
import { useAuth } from "../../../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal() {
  const { authModal, closeAuthModal } = useModal();
  if (!authModal.open) return null;
  const initialTab = authModal.mode === "register" ? "register" : "login";

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <AuthTabs initialTab={initialTab} onClose={closeAuthModal} />
      </div>
    </div>
  );
}

function AuthTabs({ initialTab = "login", onClose }) {
  const [tab, setTab] = useState(initialTab);
  return (
    <>
      <div className="modal-header">
        <button
          className={`tab-btn ${tab === "login" ? "active" : ""}`}
          onClick={() => setTab("login")}
        >
          Sign in
        </button>
        <button
          className={`tab-btn ${tab === "register" ? "active" : ""}`}
          onClick={() => setTab("register")}
        >
          Create account
        </button>
      </div>

      <div className="modal-body">
        {tab === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={() => setTab("login")} />
        )}
      </div>
    </>
  );
}

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result?.error) return setErr(result.error);
    onSuccess?.(); // close modal
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <label>Email</label>
      <input name="email" type="email" value={form.email} onChange={onChange} required />
      <label>Password</label>
      <input name="password" type="password" value={form.password} onChange={onChange} required />
      {err && <div className="auth-error">{err}</div>}
      <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result?.error) return setErr(result.error);
    onSuccess?.();
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <label>Full name</label>
      <input name="fullName" value={form.fullName} onChange={onChange} required />
      <label>Email</label>
      <input name="email" type="email" value={form.email} onChange={onChange} required />
      <label>Phone Number</label>
      <input name="phoneNumber" type="text" value={form.phoneNumber} onChange={onChange} required />
      <label>Password</label>
      <input name="password" type="password" value={form.password} onChange={onChange} required />
      {err && <div className="auth-error">{err}</div>}
      <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
    </form>
  );
}
