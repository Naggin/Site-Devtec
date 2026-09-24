/** Non-translatable contact and link constants. */
export const profile = {
  brand: "Devtec",
  name: "Antonio Junior",
  email: "antoniocjr1998@gmail.com",
  github: "https://github.com/Naggin",
  githubLabel: "github.com/Naggin",
  site: "https://ajrdevtec.vercel.app",
};

export type { Project } from "./i18n/types";

import { pt } from "./i18n/pt";

/** @deprecated Import from useLanguage().t instead — kept for tests migrating gradually. */
export const navItems = pt.navItems;
export const stacks = pt.stacks;
export const stackPipeline = pt.stackPipeline;
export const gitTimeline = pt.gitTimeline;
export const gitCommits = pt.gitCommits;
export const projects = pt.projects;
export const projectTypes = pt.projectTypes;

export type ProjectType = (typeof pt.projectTypes)[number];
