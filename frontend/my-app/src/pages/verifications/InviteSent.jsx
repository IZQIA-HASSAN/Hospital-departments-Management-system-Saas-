import { useLocation, useNavigate } from "react-router-dom";

function InviteSent() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  return (
    <div className="invite-sent-container">
      <h2>Invite Sent</h2>
      <p>
        An invitation email has been sent to{" "}
        <strong>{email || "the staff member"}</strong>.
      </p>
      <p>They'll need to click the link in the email to complete signup.</p>
      <button onClick={() => navigate("/staffdash")}>Back to Dashboard</button>
    </div>
  );
}

export default InviteSent;