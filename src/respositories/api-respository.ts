import json from '../data/db.json';
import { API } from '../models/api.interface';
import { CategoryAPI } from '../models/category-api.interface';
import { Dictionary } from '../models/dictionary.interface';
import { Response } from '../models/response';

export class ApiRespository {
  getCategories(): string[] {
    return Object.keys(json);
  }
  get(): Response<CategoryAPI[]> {
    const dictionary = json as unknown as Dictionary<API[]>;
    const result: CategoryAPI[] = [];
    Object.keys(dictionary).forEach((key) => {
      const current = dictionary[key];
      current.forEach((api) => {
        result.push({
          ...api,
          category: key,
        } as unknown as CategoryAPI);
      });
    });
    return new Response<CategoryAPI[]>(result);
  }
}
