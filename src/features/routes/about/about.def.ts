import type { RouteDef } from "@features/routes/routes.type";
import aboutCtrl from "./about.ctrl";

const route: RouteDef = ['/about', { path: '/about', title: 'À propos', templateId: 'about-template', ctrl: aboutCtrl }]

export default route