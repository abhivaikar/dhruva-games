import { activityCardArt } from './activity-card-art.js';
import { treasureSceneArt } from './treasure-art.js';

const star = (x, y, size = 1, colour = '#ffdf45') => `<path d="m0-9 2.7 5.5 6 .9-4.3 4.2 1 6L0 4.8-5.4 7.6l1-6-4.3-4.2 6-.9Z" fill="${colour}" transform="translate(${x} ${y}) scale(${size})"/>`;
const cloud = (x, y) => `<path d="M0 12q-2-13 11-13 13-21 28-3 21-4 22 14 12-1 13 9H0Z" transform="translate(${x} ${y})" fill="#fffdf5" opacity=".8"/>`;

export function rocketArt(completed = 0, total = 8, showCaption = true) {
  const lights = Array.from({ length: total }, (_, i) => `<circle cx="${173 + (i % 4) * 44}" cy="${204 + Math.floor(i / 4) * 22}" r="6" fill="${i < completed ? '#f3cf76' : '#6d64a6'}"/>`).join('');
  return `<svg viewBox="0 0 480 300" aria-hidden="true"><rect width="480" height="300" rx="24" fill="#292773"/><circle cx="377" cy="68" r="33" fill="#ffdf45"/>${star(92, 57)}${star(332, 123, .6)}${star(399, 186, .7)}${star(138, 148, .5)}<g class="rocket-body" style="--fuel:${completed / total}"><path d="M205 185V101q0-48 35-72 35 24 35 72v84Z" fill="#fffdf3" stroke="#d5c6ff" stroke-width="2"/><path d="M205 136q-36 11-35 57l35-16m70-41q36 11 35 57l-35-16" fill="#ff7940"/><path d="M216 191q24 45 48 0" fill="${completed ? '#ff982b' : '#ff9e47'}"/><path d="M222 191q18 27 36 0" fill="#ffed72"/><circle cx="240" cy="111" r="20" fill="#49d9ee" stroke="#7140bc" stroke-width="7"/><path d="M207 72h66" stroke="#8c4cde" stroke-width="6"/><path d="M217 162h46" stroke="#7140bc" stroke-width="5" stroke-linecap="round"/></g><path d="M90 264h300" stroke="#6862aa" stroke-width="2"/>${lights}${showCaption ? '<text x="240" y="276" text-anchor="middle" fill="#e2d9ff" font-family="sans-serif" font-size="10" letter-spacing="3">LITTLE IDEAS, BIG LIFT-OFF</text>' : ''}</svg>`;
}

export function illustration(type) {
  if (['colouring', 'dots', 'puzzles'].includes(type)) return activityCardArt(type);
  let content = '';
  if (type === 'train') content = `<rect width="480" height="245" fill="#a5e4ff"/>${cloud(60, 44)}<circle cx="394" cy="51" r="25" fill="#ffe140"/><path d="M0 170q120-65 240-20t240-10v105H0" fill="#4bc591"/><path d="M0 209h480m-480 10h480" stroke="#369178" stroke-width="3"/><g><rect x="48" y="108" width="175" height="91" rx="18" fill="#ffffff"/><path d="M249 108h106q34 0 48 37l12 32q5 22-17 22H249Z" fill="#ffffff"/><path d="M48 177h175v13H48m201-13h161v13H249" fill="#7934e5"/><g fill="#53d9ef"><rect x="64" y="124" width="41" height="37" rx="8"/><rect x="117" y="124" width="41" height="37" rx="8"/><rect x="170" y="124" width="38" height="37" rx="8"/><rect x="264" y="124" width="40" height="37" rx="8"/><rect x="316" y="124" width="35" height="37" rx="8"/></g><path d="M363 123q22 8 30 37h-29Z" fill="#263b73"/><path d="M223 152h26v35h-26" fill="#b197db"/><g fill="#263354"><rect x="72" y="194" width="32" height="13" rx="6"/><rect x="168" y="194" width="32" height="13" rx="6"/><rect x="274" y="194" width="32" height="13" rx="6"/><rect x="364" y="194" width="32" height="13" rx="6"/></g><rect x="281" y="96" width="68" height="15" rx="5" fill="#5721ba"/><text x="315" y="107" font-family="sans-serif" font-size="9" fill="white" text-anchor="middle">NE18 → NE1</text></g>`;
  if (type === 'transport') content = `<rect width="480" height="245" fill="#8be4c0"/>${cloud(307, 28)}<path d="M34 68h112q31 0 31 31v34q0 22 26 22h237" stroke="#9553e8" stroke-width="10" fill="none"/><path d="M39 32v103q0 36 39 36h353" stroke="#18ae9b" stroke-width="8" fill="none"/>${[66, 139, 235, 333, 418].map((x, i) => `<circle cx="${x}" cy="${i < 2 ? 68 : 155}" r="9" fill="#ffffff" stroke="#9553e8" stroke-width="3"/>`).join('')}<rect x="102" y="119" width="258" height="90" rx="18" fill="#ff9c3f"/><rect x="114" y="131" width="231" height="37" rx="8" fill="#73def0"/><path d="M281 131v69m-111-67v35m55-35v35" stroke="#ed6f2f" stroke-width="5"/><circle cx="154" cy="209" r="17" fill="#24354e"/><circle cx="310" cy="209" r="17" fill="#24354e"/><g fill="#dfecff"><circle cx="154" cy="209" r="8"/><circle cx="310" cy="209" r="8"/></g><rect x="201" y="104" width="87" height="20" rx="6" fill="#15675c"/><text x="245" y="118" text-anchor="middle" fill="#fff7e2" font-size="10" font-family="sans-serif">LET’S GO, SG!</text>`;
  if (type === 'maths') return rocketArt(0, 8, false).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
  if (type === 'world') content = `<rect width="480" height="245" fill="#85d8ff"/>${cloud(46, 45)}${star(387, 49)}<ellipse cx="240" cy="222" rx="111" ry="10" fill="#42b3db"/><circle cx="240" cy="117" r="91" fill="#21a6e2" stroke="#1889cc" stroke-width="2"/><path d="m178 54 30-11 11 23 26 4-11 28-25 9 9 26-23 16-22-32-20-6 1-32Zm48 83 33 12 19 24-15 20-16 14-10-30Zm68-65-25-10-17 17 7 20 25 6 1 25 28-14 11-25Zm-6 79 29 3 5 24-28 7-14-15Z" fill="#70df87"/><path d="M149 117h182M240 26q-68 91 0 182 68-91 0-182M159 78h162m-162 80h162" stroke="#b1f1ef" fill="none" stroke-width="1.5" opacity=".5"/><path d="M328 136q64-80 75-29 5 18-24 27" stroke="#e9a136" stroke-width="2" stroke-dasharray="5 5" fill="none"/><circle cx="378" cy="132" r="16" fill="#ffdd45"/><path d="m378 120 4 12-4 12-4-12Z" fill="#e25778"/>`;
  if (type === 'treasure') return treasureSceneArt().replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
  if (type === 'flags') content = `<rect width="480" height="245" fill="#ff9ec9"/>${star(67, 48, .8)}${star(407, 190, .7)}<path d="M58 178q170-159 361-97" fill="none" stroke="#e6509a" stroke-width="2" stroke-dasharray="5 5"/><g transform="translate(69 73) rotate(-12)"><rect x="-7" y="-7" width="145" height="112" rx="14" fill="#ffffff"/><image href="./assets/flags/sg.svg" width="131" height="98"/></g><g transform="translate(221 39) rotate(10)"><rect x="-7" y="-7" width="144" height="111" rx="14" fill="#ffffff"/><image href="./assets/flags/jp.svg" width="130" height="97"/></g><g transform="translate(248 144) rotate(-6)"><rect x="-6" y="-6" width="112" height="86" rx="12" fill="#ffffff"/><image href="./assets/flags/br.svg" width="100" height="74"/></g>`;
  return `<svg viewBox="0 0 480 245" aria-hidden="true">${content}</svg>`;
}

export const clubMark = `<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="2" y="2" width="56" height="56" rx="18" fill="#5734e8" stroke="#39209e" stroke-width="3"/><circle cx="30" cy="30" r="19" fill="#ffdd42"/><path d="m30 13 6 17-6 17-6-17Z" fill="#f04b83"/><path d="m30 13 6 17H24Z" fill="#257dc5"/><circle cx="30" cy="30" r="3" fill="#fff"/></svg>`;

export function heroArt() {
  return `<svg viewBox="0 0 540 360" aria-hidden="true">
  <defs><pattern id="hero-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#ffffff" opacity=".18"/></pattern></defs>
  <circle cx="280" cy="178" r="153" fill="#7859ef"/><circle cx="280" cy="178" r="153" fill="url(#hero-dots)"/>
  <ellipse cx="280" cy="189" rx="222" ry="109" fill="none" stroke="#c6b8ff" stroke-width="2" stroke-dasharray="6 9" transform="rotate(-18 280 189)"/>
  ${star(67, 60, 1.5)}${star(464, 246, 1.4)}${star(395, 327, .8)}${star(169, 321, .7, '#ff8cb4')}${star(467, 107, .6, '#91eaff')}
  ${cloud(96, 100)}${cloud(353, 284)}
  <circle cx="283" cy="174" r="94" fill="#36c1ed" stroke="#9feaff" stroke-width="4"/>
  <path d="m235 104 35 2 17 25-24 22-27-4-17 26-23-24 7-27Zm63 65 39-22 27 19-14 33-29 13-8 34-26-13 5-33Z" fill="#8be175" stroke="#63c56b" stroke-width="2"/>
  <path d="M189 174h188m-94-94q-62 94 0 188 62-94 0-188M206 127h154m-154 94h154" fill="none" stroke="#d1fbf2" stroke-width="1.6" opacity=".45"/>
  <g class="floating-train"><g transform="translate(30 195) rotate(-10)">
  <rect x="0" y="7" width="173" height="107" rx="26" fill="#3b219b" opacity=".3"/>
  <rect width="173" height="107" rx="26" fill="#fffdf1" stroke="#b8a0fc" stroke-width="3"/>
  <rect x="13" y="14" width="147" height="47" rx="13" fill="#63def4"/>
  <circle cx="52" cy="36" r="6" fill="#293365"/><circle cx="120" cy="36" r="6" fill="#293365"/>
  <path d="M72 74q16 15 31 0" stroke="#6737c2" fill="none" stroke-width="5" stroke-linecap="round"/>
  <path d="M13 95h147" stroke="#8b41e5" stroke-width="10" stroke-linecap="round"/>
  <circle cx="26" cy="75" r="7" fill="#ffc9c7"/><circle cx="147" cy="75" r="7" fill="#ffc9c7"/>
  <rect x="59" y="-14" width="55" height="20" rx="7" fill="#ffdc47"/><text x="86" y="0" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="10" fill="#59318c">LET’S GO!</text>
  <path d="m34 111-9 14m114-14 9 14" stroke="#e9d8ff" stroke-width="6" stroke-linecap="round"/>
  </g></g>
  <g class="floating-flag"><g transform="translate(371 41) rotate(13)"><rect y="5" width="119" height="100" rx="20" fill="#35208b" opacity=".3"/><rect width="119" height="100" rx="20" fill="#fff"/><image href="./assets/flags/sg.svg" x="9" y="10" width="101" height="76"/></g></g>
  <g transform="translate(100 27) rotate(-14)"><rect width="77" height="69" rx="19" fill="#ffdc47" stroke="#fff09c" stroke-width="3"/><path d="M23 34h31M38 19v31" stroke="#824bd1" stroke-width="8" stroke-linecap="round"/></g>
  <g transform="translate(395 205) rotate(16)"><rect width="78" height="87" rx="21" fill="#ff8fba" stroke="#ffc2d9" stroke-width="3"/><circle cx="39" cy="43" r="26" fill="#fff6bd"/><path d="m39 22 8 21-8 21-8-21Z" fill="#ef575d"/><path d="m39 22 8 21H31Z" fill="#4b8bcf"/><circle cx="39" cy="43" r="4" fill="white"/></g>
  <circle cx="218" cy="48" r="7" fill="#6eeacb"/><circle cx="493" cy="181" r="7" fill="#ff91bc"/><circle cx="224" cy="305" r="5" fill="#ffdd42"/>
  </svg>`;
}
