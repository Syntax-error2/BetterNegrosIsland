import { Link } from 'react-router-dom';

export default function CitizenShortcuts(){
  return <section className="citizen-shortcuts" aria-labelledby="citizen-questions"><h2 id="citizen-questions">What would you like to know?</h2><p>Start with a question. Follow it to the published evidence.</p><div className="citizen-question-grid">
    <Link to="/#community-spotlight"><strong>What mentions my community?</strong><span>Choose a place and explore qualified title matches.</span></Link>
    <Link to="/analytics#chart-a"><strong>What differs between budget versions?</strong><span>Read the NEP and House bill comparison on the same scale.</span></Link>
    <Link to="/budget-history"><strong>What was appropriated in earlier years?</strong><span>Browse enacted GAA records for FY2020–FY2026.</span></Link>
    <Link to="/compare"><strong>How do two records compare?</strong><span>Inspect exact amounts, stages and source references side by side.</span></Link>
    <Link to="/budget-guide"><strong>How do I read a budget figure?</strong><span>Take the one-minute guide, with a real published example.</span></Link>
    <Link to="/projects"><strong>What can I share responsibly?</strong><span>Choose a record and create a dated evidence card with its source.</span></Link>
  </div></section>;
}
