import { Component,type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** A failed lazy chunk after deployment must offer recovery, not a blank page. */
export default class PageErrorBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(!this.state.failed)return this.props.children;
    return <main id="main-content" tabIndex={-1} className="page page--reading main"><h1>This view could not be loaded.</h1><p className="notice" role="alert">Your connection may be interrupted, or a newer site version may be available. Reload this page to try again. No replacement budget figures have been supplied.</p><p><button className="button button-primary" onClick={()=>window.location.reload()}>Reload current version</button></p><p><Link to="/">Return to overview</Link></p></main>;
  }
}
