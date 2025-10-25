import type { RouteDef } from "../routes.type";
import homeCtrl from "./home.ctrl";

const route: RouteDef = ['/', { path: '/', title: 'ROADCAST LAYOUT', templateId: 'home', ctrl: homeCtrl }]

export default route