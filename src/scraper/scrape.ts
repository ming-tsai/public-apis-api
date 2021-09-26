import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { API } from '../models/api.interface';
import { Auth } from '../models/auth.enum';
import { Category } from '../models/category.interface';
import { Cors } from '../models/cors.enum';
import { Dictionary } from '../models/dictionary.interface';
import { Scrape as IScrape } from '../models/scrape.interface';
import json from "../data/db.json";

export class Scrape implements IScrape {
  filePath: string;
  constructor() {
    this.filePath = path.resolve(__dirname, '../data/db.json');
  }

  run(): void {
    const data = json as unknown as Dictionary<API[]>;

    this.categories(data).then((updated) => fs.writeFileSync(this.filePath, JSON.stringify(updated), 'utf8'));
  }

  private categories = async (data: Dictionary<API[]>): Promise<Dictionary<API[]>> => {
    const html = await this.download();
    const $ = cheerio.load(html);
    const index = $('h2 > a[href="#index"]').parent().next('ul').children();
    index.each((_, element) => {
      const { name, apis } = this.getCategory($, element);
      if (data[name]) {
        data[name] = this.updateCategory(data[name], apis);
      } else {
        data[name] = apis;
      }
    });
    return data;
  };

  private download = async (): Promise<string> => {
    const url = process.env.PUBLIC_APIS_README;
    let result = '';
    if (!url) {
      throw new Error('Environment variable PUBLIC_APIS_README is not set');
    }

    try {
      const response = await axios.get(url);
      result = response.data;
    } catch (error) {
      console.log(error);
    }
    return result;
  };

  private getCategory = ($: cheerio.Root, element: cheerio.Element): Category => {
    const name = $(element).text();
    const href = $('li > a', element).attr('href') as unknown as string;
    const title = $(`h3 > a[href="${href}"]`).parent();
    const table = title.next('table');
    const apis: API[] = [];
    $('tbody > tr', table).each((index, trElement) => {
      if (index !== 0) {
        apis.push(this.getApi($, trElement));
      }
    });
    return { name, apis } as Category;
  };

  getApi($: cheerio.Root, element: cheerio.Element): API {
    const api: API = {
      id: uuidv4(),
      name: '',
      url: '',
      description: '',
      auth: Auth.No,
      with_https: false,
      with_cors: Cors.No,
      updated_at: new Date(),
    };

    const tds = $(element).find('td');
    $(tds).each((i, tdElement) => {
      const val = $(tdElement).text();
      switch (i) {
        case 0:
          api.url = $('a', tdElement).attr('href') as string;
          api.name = val;
          break;
        case 1:
          api.description = val;
          break;
        case 2:
          api.auth = val as unknown as Auth;
          break;
        case 3:
          api.with_https = val as unknown as boolean;
          break;
        case 4:
          api.with_cors = val as unknown as Cors;
          break;
      }
    });
    return api;
  }

  private updateCategory = (entities: API[], data: API[]): API[] => {
    const result: API[] = [];
    data.forEach((item) => {
      let found = entities.find((entity) => item.name === entity.name);
      if (found && this.isModified(found, item)) {
        found.url = item.url;
        found.description = item.description;
        found.auth = item.auth;
        found.with_https = item.with_https;
        found.with_cors = item.with_cors;
        found.updated_at = item.updated_at;
      } else if (!found) {
        found = item;
      }
      result.push(found);
    });
    return result;
  };

  private isModified = (entity: API, data: API): boolean => {
    return (
      entity.url !== data.url ||
      entity.description !== data.description ||
      entity.auth !== data.auth ||
      entity.with_https !== data.with_https ||
      entity.with_cors !== data.with_cors
    );
  };
}
