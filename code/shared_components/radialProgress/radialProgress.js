import { css, html, LitElement, unsafeCSS } from 'lit-element';
import style from './radialProgress.scss';
import * as d3 from 'd3'


export class RadialProgress extends LitElement {
    constructor() {
        super();

        this.maxValue = 1;
        this.minValue = 0;
        this.value = 0;
        this.text = '';
    }

    static get styles() {
        return css`
      ${unsafeCSS(style)}
    `;
    }

    static get properties() {
        return {
            minValue: { type: Number },
            maxValue: { type: Number },
            value: { type: Number },
            text: { type: String },
            draw: { type: Function },
            svg: { type: Object },
        };
    }


    render() {
        return html`<div class="radialProgress">
      <div >
        <p class="radialProgress__text">RADIAL</p>
        <div id="drawArea"></div>
      </div>
    </div>`;
    }

    // gets called after render function is finished
    // so the radial progress can be drawn
    firstUpdated() {
        console.log("first")
        const element = this.shadowRoot.querySelector("#drawArea");
        this.svg = d3
        .select(element)
        .append('svg')
        .attr('width', 100)
        .attr('height', 100)
        .append('g')
        .attr('transform', `translate(55, 55)`)


        // An arc will be created
        var arc = d3.arc()
            .innerRadius(38)
            .outerRadius(45)
            .startAngle(0)
            .endAngle(this.value*Math.PI/2);

        this.svg.append("path")
            .attr("class", "arc")
            .attr("d", arc)
            .attr("fill", "#8faf30");

        this.svg.append('text')
        .attr("text-anchor", "middle")
        .attr("y", +12)
        .attr('font-size', '36px')  
        .text(this.value);
        
    }
}

customElements.get('wc-radial-progress') || customElements.define('wc-radial-progress', RadialProgress);
