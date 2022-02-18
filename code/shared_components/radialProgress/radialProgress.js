import { css, html, LitElement, unsafeCSS } from 'lit-element';
import style from './radialProgress.scss';
import * as d3 from 'd3'


export class RadialProgress extends LitElement {
    constructor() {
        super();

        this.maxValue = 1;
        this.minValue = 0;
        this.value = 0;
        this.width = 0;
        this.height = 0;
        this.fontSize = 32;
        this.delay = 0;
        this.duration = 1000;
        this.text = '';
        this.id = ''; // to trigger updated on station change, if minValue/maxValue don't change
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
            width: { type: Number },
            height: { type: Number },
            fontSize: { type: Number },
            delay: { type: Number },
            duration: { type: Number },
            text: { type: String },
            id: { type: String },
            svg: { type: Object },
        };
    }


    render() {

        return html`<div class="radialProgress">
      <div class="${this.text ? 'radialProgress__drawArea_cars' : 'radialProgress__drawArea'}">
        <div id="drawArea" ></div>
            ${this.text ? html`<div><p class="brandName">${this.text}</p></div>` : ''}
      </div>
    </div>`;
    }

    // gets called after render function is finished
    // so the radial progress can be drawn
    updated(changedProperties) {

        // check if values changed to prevent infinite loop
        if (changedProperties.has("id") || changedProperties.has("value") || changedProperties.has("maxValue")) {
            const element = this.shadowRoot.querySelector("#drawArea");
            const finalAngle = this.value * Math.PI / (this.maxValue / 2);
            const tau = 2 * Math.PI;

            //remove svg before adding new one
            d3.select(element).select('svg').remove();

            this.svg = d3
                .select(element)
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .append('g')
                .attr('transform', 'translate(' + this.width / 2 + ', ' + this.height / 2 + ')')

            // An arc function with all values bound except the endAngle. So, to compute an
            // SVG path string for a given angle, we pass an object with an endAngle
            // property to the `arc` function, and it will return the corresponding string.
            var arc = d3.arc()
                .innerRadius((this.height / 2) - (this.height / 10))
                .outerRadius((this.height / 2) - (this.height / 6))
                .startAngle(this.minValue);


            // Add the background arc, from 0 to 100% (tau).
            this.svg.append("path")
                .datum({ endAngle: tau })
                .style("fill", "#E1E1E1")
                .attr("d", arc);

            // calc arc traffic light color
            let color;
            if (this.value === undefined || this.value <= 0) {
                color = "#DC1B22"; //red
            } else if (this.value <= this.maxValue / 2) {
                color = "#f28e1e"; //orange
            } else {
                color = "#8faf30"; //green
            }

            // Add the foreground arc in orange, currently showing 12.7%.
            var foreground = this.svg.append("path")
                .datum({ endAngle: this.minValue})
                .style("fill", color)
                .attr("d", arc);

            // Every so often, start a transition to a new random angle. The attrTween
            // definition is encapsulated in a separate function (a closure) below.
            foreground.transition()
                .duration(this.duration)
                .delay(this.delay)
                .attrTween("d", arcTween(finalAngle));


            // center text with available car amount
            this.svg.append('text')
                .attr("text-anchor", "middle")
                .attr("y", this.fontSize / 3)
                .attr('font-size', this.fontSize + 'px')
                .text(this.value);

            // from http://bl.ocks.org/mbostock/5100636
            function arcTween(newAngle) {
                return function (d) {
                    var interpolate = d3.interpolate(d.endAngle, newAngle);
                    return function (t) {
                        d.endAngle = interpolate(t);
                        return arc(d);
                    };
                };
            }
        }

    }
}

customElements.get('wc-radial-progress') || customElements.define('wc-radial-progress', RadialProgress);
