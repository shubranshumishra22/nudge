import React from 'react';
import HeaderV1 from './templates/header/HeaderV1';
import HeroV1 from './templates/hero/HeroV1';
import HeroV2 from './templates/hero/HeroV2';
import ProductsV1 from './templates/products/ProductsV1';
import AboutV1 from './templates/about/AboutV1';
import ContactV1 from './templates/contact/ContactV1';
import FooterV1 from './templates/footer/FooterV1';
import {
  HeaderV1_CSS,
  HeroV1_CSS,
  HeroV2_CSS,
  ProductsV1_CSS,
  AboutV1_CSS,
  ContactV1_CSS,
  FooterV1_CSS,
} from './css-templates';

export interface RegistryEntry {
  component: React.ComponentType<any>;
  css: string;
}

export const componentRegistry: Record<string, RegistryEntry> = {
  HeaderV1: {
    component: HeaderV1,
    css: HeaderV1_CSS,
  },
  HeroV1: {
    component: HeroV1,
    css: HeroV1_CSS,
  },
  HeroV2: {
    component: HeroV2,
    css: HeroV2_CSS,
  },
  ProductsV1: {
    component: ProductsV1,
    css: ProductsV1_CSS,
  },
  AboutV1: {
    component: AboutV1,
    css: AboutV1_CSS,
  },
  ContactV1: {
    component: ContactV1,
    css: ContactV1_CSS,
  },
  FooterV1: {
    component: FooterV1,
    css: FooterV1_CSS,
  },
};
