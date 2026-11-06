import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";
export const productController = {
  publicCategories: async (_q: Request, r: Response) =>
    r.json({ success: true, data: await productService.categories(true) }),
  categories: async (_q: Request, r: Response) =>
    r.json({ success: true, data: await productService.categories() }),
  createCategory: async (q: Request, r: Response) =>
    r
      .status(201)
      .json({
        success: true,
        message: "Đã tạo danh mục",
        data: await productService.createCategory(q.body),
      }),
  updateCategory: async (q: Request, r: Response) =>
    r.json({
      success: true,
      message: "Đã cập nhật danh mục",
      data: await productService.updateCategory(String(q.params.id), q.body),
    }),
  removeCategory: async (q: Request, r: Response) => {
    await productService.removeCategory(String(q.params.id));
    r.status(204).send();
  },
  publicList: async (q: Request, r: Response) =>
    r.json({ success: true, data: await productService.list(q.query, true) }),
  list: async (q: Request, r: Response) =>
    r.json({ success: true, data: await productService.list(q.query) }),
  publicDetail: async (q: Request, r: Response) =>
    r.json({
      success: true,
      data: await productService.detailBySlug(String(q.params.slug)),
    }),
  create: async (q: Request, r: Response) =>
    r
      .status(201)
      .json({
        success: true,
        message: "Đã tạo sản phẩm",
        data: await productService.create(q.body),
      }),
  update: async (q: Request, r: Response) =>
    r.json({
      success: true,
      message: "Đã cập nhật sản phẩm",
      data: await productService.update(String(q.params.id), q.body),
    }),
  remove: async (q: Request, r: Response) => {
    await productService.remove(String(q.params.id));
    r.status(204).send();
  },
};
