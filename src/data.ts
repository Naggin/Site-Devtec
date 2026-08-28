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
export const proofPoints = pt.proofPoints;
export const stacks = pt.stacks;
export const stackPipeline = pt.stackPipeline;
export const deploySteps = pt.deploySteps;
export const dependencyNodes = pt.dependencyNodes;
export const bentoItems = pt.bentoItems;
export const ciChecks = pt.ciChecks;
export const ciRepo = pt.ciRepo;
export const gitTimeline = pt.gitTimeline;
export const gitCommits = pt.gitCommits;
export const processSteps = pt.processSteps;
export const deliverables = pt.deliverables;
export const faq = pt.faq;
export const services = pt.services;
export const projects = pt.projects;
export const projectTypes = pt.projectTypes;

export type ProjectType = (typeof pt.projectTypes)[number];
