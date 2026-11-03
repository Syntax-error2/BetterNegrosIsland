import { Link } from 'react-router-dom';

export default function ResponsibleUse() {
  return <aside className="responsible-use" aria-label="Data and privacy disclaimer"><p><strong>Share evidence with context.</strong> Published proposals and appropriations do not prove actual spending or wrongdoing. Verify the linked source and keep its budget stage, date and limitations attached.</p><p>Review titles and documents before sharing. Do not add or republish unrelated personal identifiers, private contact details or sensitive personal information. Public availability does not remove privacy responsibilities.</p><div><Link to="/methodology#data-disclaimer">Full data disclaimer</Link><Link to="/privacy">Privacy Notice</Link></div></aside>;
}
