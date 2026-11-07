// hls.js ships no type file for its smaller "light" build; it has the same API
// as the full build, so it takes the full build's types.
declare module 'hls.js/light' {
  import Hls from 'hls.js';
  export default Hls;
}
