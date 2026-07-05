/**
 * NASA SVS "Moon Phase and Libration" (Dial-A-Moon) renders the lunar disk with a
 * geocentric **orthographic** view — no perspective foreshortening on the limb.
 * We match that with an orthographic camera; zoom sets apparent size.
 *
 * @see https://svs.gsfc.nasa.gov/5587/
 */
export const MOON_CAMERA = {
  desktop: {
    position: [0, 0, 10] as [number, number, number],
    zoom: 110,
  },
  mobile: {
    position: [0, 0, 10] as [number, number, number],
    zoom: 90,
  },
  /** OrbitControls zoom limits (orthographic dolly). */
  zoom: { min: 72, max: 155 },
} as const
