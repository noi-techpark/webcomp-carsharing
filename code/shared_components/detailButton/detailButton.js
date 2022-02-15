import { LitElement, html, css, unsafeCSS } from 'lit-element';
import style from './detailButton.scss';


export class DetailButton extends LitElement {
  constructor() {
    super();
    this.text = '---';
  }

  static get styles() {
    return css`
      ${unsafeCSS(style)}
    `;
  }

  static get properties() {
    return {
      text: { type: String },
    };
  }

  render() {
    return html`<div class="detailButton">
      <div>${this.text}</div>
    </div>`;
  }
}

customElements.get('wc-detail-button') || customElements.define('wc-detail-button', DetailButton);
