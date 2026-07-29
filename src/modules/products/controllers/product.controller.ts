import { Request, Response } from 'express';
import * as productService from '../services/product.service';

// --- Product CRUD Controllers ---

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, brandId, productName, slug, description, thumbnail, status, images, initialVariant } = req.body;

    if (!categoryId || !productName || !slug) {
      res.status(400).json({ error: 'categoryId, productName và slug là bắt buộc.' });
      return;
    }

    const product = await productService.createProduct({
      categoryId,
      brandId: brandId || null,
      productName,
      slug,
      description,
      thumbnail,
      status,
      images,
      initialVariant,
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const brandId = req.query.brandId as string | undefined;
    const status = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const result = await productService.listProducts({
      categoryId,
      brandId,
      status,
      page,
      limit,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProduct(id);
    res.json(product);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    res.json(product);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoryId, brandId, productName, slug, description, thumbnail, status, images } = req.body;

    const updateData: any = {
      productName,
      slug,
      description,
      thumbnail,
      status,
      images,
    };

    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    if (brandId !== undefined) {
      updateData.brandId = brandId || null;
    }
    
    const product = await productService.updateProduct(id, updateData);
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await productService.deleteProduct(id, softDelete);
    res.json({ message: 'Xóa sản phẩm thành công.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// --- Product Variant CRUD Controllers ---

export const addProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      productId,
      size,
      sku,
      color,
      price,
      salePrice,
      originalPriceCNY,
      exchangeRate,
      shippingCostVND,
      stock,
      image,
      images,
      weight,
      status,
    } = req.body;

    if (!productId || !sku || price === undefined) {
      res.status(400).json({ error: 'productId, sku và price là bắt buộc.' });
      return;
    }

    const variant = await productService.addProductVariant({
      productId,
      size,
      sku,
      color,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      originalPriceCNY: originalPriceCNY ? Number(originalPriceCNY) : null,
      exchangeRate: exchangeRate ? Number(exchangeRate) : null,
      shippingCostVND: shippingCostVND ? Number(shippingCostVND) : 0,
      stock: stock !== undefined ? Number(stock) : undefined,
      image,
      images: Array.isArray(images) ? images : [],
      weight: weight ? Number(weight) : null,
      status,
    });
    res.status(201).json(variant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      size,
      sku,
      color,
      price,
      salePrice,
      originalPriceCNY,
      exchangeRate,
      shippingCostVND,
      stock,
      image,
      images,
      weight,
      status,
    } = req.body;

    const variant = await productService.updateProductVariant(id, {
      size,
      sku,
      color,
      price: price !== undefined ? Number(price) : undefined,
      salePrice: salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : undefined,
      originalPriceCNY: originalPriceCNY !== undefined ? (originalPriceCNY ? Number(originalPriceCNY) : null) : undefined,
      exchangeRate: exchangeRate !== undefined ? (exchangeRate ? Number(exchangeRate) : null) : undefined,
      shippingCostVND: shippingCostVND !== undefined ? (shippingCostVND ? Number(shippingCostVND) : 0) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      image,
      ...(images !== undefined ? { images: Array.isArray(images) ? images : [] } : {}),
      weight: weight !== undefined ? (weight ? Number(weight) : null) : undefined,
      status,
    });
    res.json(variant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const softDelete = req.query.softDelete !== 'false';
    await productService.deleteProductVariant(id, softDelete);
    res.json({ message: 'Xóa phiên bản sản phẩm thành công.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
