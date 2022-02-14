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
        <div id="drawArea"></div>
      </div>
    </div>`;
    }

    // gets called after render function is finished
    // so the radial progress can be drawn
    updated(changedProperties) {

        // check if values changed to prevent infinite loop
        if (changedProperties.has("value") || changedProperties.has("maxValue")) {
            const element = this.shadowRoot.querySelector("#drawArea");

            //remove svg before adding new one
            d3.select(element).select('svg').remove();


            this.svg = d3
                .select(element)
                .append('svg')
                .attr('width', "100%")
                .attr('height', 150)
                .append('g')
                .attr('transform', `translate(150, 75)`)

            // An arc will be created
            let greyArc = d3.arc()
                .innerRadius(60)
                .outerRadius(70)
                .startAngle(this.minValue)
                .endAngle(Math.PI * 2);

            this.svg.append("path")
                .attr("class", "arc")
                .attr("d", greyArc)
                .attr("fill", "#E1E1E1");

            // An arc will be created
            let arc = d3.arc()
                .innerRadius(60)
                .outerRadius(70)
                .startAngle(this.minValue)
                .endAngle(this.value * Math.PI / (this.maxValue / 2));

            // calc arc traffic light color
            let color;
            if (this.value === undefined || this.value <= 0) {
                color = "#DC1B22"; //red
            } else if (this.value <= this.maxValue / 2) {
                color = "#f28e1e"; //orange
            } else {
                color = "#8faf30"; //green
            }

            this.svg.append("path")
                .attr("class", "arc")
                .attr("d", arc)
                .attr("fill", color);

            // center text with available car amount
            this.svg.append('text')
                .attr("text-anchor", "middle")
                .attr("y", +12)
                .attr('font-size', '32px')
                .text(this.value);
        }


    }
}

customElements.get('wc-radial-progress') || customElements.define('wc-radial-progress', RadialProgress);
