import React from 'react';
import HeaderV1 from './templates/header/HeaderV1';
import HeroV1 from './templates/hero/HeroV1';
import HeroV2 from './templates/hero/HeroV2';
import ProductsV1 from './templates/products/ProductsV1';
import AboutV1 from './templates/about/AboutV1';
import ContactV1 from './templates/contact/ContactV1';
import FooterV1 from './templates/footer/FooterV1';

export interface RegistryEntry {
  component: React.ComponentType<any>;
  cssPath: string;
}

export const componentRegistry: Record<string, RegistryEntry> = {
  HeaderV1: {
    component: HeaderV1,
    cssPath: 'header/HeaderV1.css',
  },
  HeroV1: {
    component: HeroV1,
    cssPath: 'hero/HeroV1.css',
  },
  HeroV2: {
    component: HeroV2,
    cssPath: 'hero/HeroV2.css',
  },
  ProductsV1: {
    component: ProductsV1,
    cssPath: 'products/ProductsV1.css',
  },
  AboutV1: {
    component: AboutV1,
    cssPath: 'about/AboutV1.css',
  },
  ContactV1: {
    component: ContactV1,
    cssPath: 'contact/ContactV1.css',
  },
  FooterV1: {
    component: FooterV1,
    cssPath: 'footer/FooterV1.css',
  },
};
