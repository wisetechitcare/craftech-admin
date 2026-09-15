/**
 * Every ordered list in the Admin that can be dragged. A row may only be
 * dropped on a row carrying the same id, so nothing can be dragged from one
 * list into another — which only holds while no two of these are equal. One
 * enum rather than a constant per feature, so that stays checkable at a glance.
 */
export enum DragList {
  ABOUT_SECTIONS = "about.sections",
  ABOUT_STATS = "about.stats.rows",
  ABOUT_DETAILS = "about.whoWeAre.details",
  ABOUT_VALUES = "about.values.items",
  ABOUT_WHAT_WE_DO = "about.whatWeDo.items",
  ABOUT_WHY_CHOOSE_US = "about.whyChooseUs.items",
  ABOUT_HOW_WE_WORK = "about.howWeWork.steps",
  HERO_SLIDES = "hero.slides",
  NAVBAR_LINKS = "navbar.links",
}
