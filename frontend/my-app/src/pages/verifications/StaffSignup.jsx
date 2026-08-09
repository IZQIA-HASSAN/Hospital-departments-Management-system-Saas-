import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function StaffSignup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | valid | invalid
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    fetch(`http://localhost:5000/api/auth/verify-invite?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("http://localhost:5000/api/auth/signup-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Signup failed");
    navigate("/login");
  };

  if (status === "loading") return <p>Verifying invite link...</p>;

  if (status === "invalid")
    return (
      <div>
        <h2>Invalid or Expired Link</h2>
        <p>This invite link is no longer valid. Contact your admin for a new one.</p>
      </div>
    );

    const handlenavigation = (e)=>{
e.preventDefault;
navigate("/staff")
    }

  return (
    <div className="staff-signup-container">
      <h2>Complete Your Signup</h2>
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} disabled />

        <label>Full Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label>Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" onClick={handlenavigation}>Create Account</button>
      </form>
    </div>
  );
}

export default StaffSignup;