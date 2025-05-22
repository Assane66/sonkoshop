'use client';

import { useState } from 'react';
import type { Product } from '@/types';
import { ProductCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // DialogTrigger, DialogFooter, DialogClose removed as they are not used
import { ProductForm } from '@/components/admin/ProductForm';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const initialProducts: Product[] = [
  { id: '1', name: 'Maillot Sénégal Authentique', description: 'Portez les couleurs des Lions avec fierté.', price: 45000, category: ProductCategory.Maillots, imageUrl: 'https://placehold.co/40x40.png', stock: 50, featured: true, imageAiHint: 'senegal football jersey', sizes: ['S', 'M', 'L'] }, // colors removed
  { id: '2', name: 'Chaussures "Vitesse Ultime"', description: 'Légères et réactives pour des accélérations.', price: 62000, category: ProductCategory.Chaussures, imageUrl: 'https://placehold.co/40x40.png', stock: 30, imageAiHint: 'soccer cleats', sizes: ['40', '41', '42'] }, // colors removed
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // Add confirmation dialog here in a real app
    setProducts(products.filter((p) => p.id !== productId));
    toast({ title: "Product Deleted", description: "The product has been successfully deleted." });
  };

  const handleFormSubmit = (data: any) => {
    const productData = {
      ...data,
      sizes: data.sizes ? data.sizes.split(',').map((s:string) => s.trim()) : [],
      // colors: data.colors ? data.colors.split(',').map((c:string) => c.trim()) : [], // colors removed
    };

    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p))
      );
      toast({ title: "Product Updated", description: "The product has been successfully updated." });
    } else {
      setProducts([...products, { ...productData, id: String(Date.now()) }]);
      toast({ title: "Product Added", description: "The new product has been successfully added." });
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
        <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of this product.' : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="bg-card p-6 rounded-lg shadow-md">
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                      data-ai-hint={product.imageAiHint || 'product icon'}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                  <TableCell>{product.price.toLocaleString()} FCFA</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.featured ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
           <p className="text-center py-4 text-muted-foreground">No products found. Add new products to see them here.</p>
        )}
      </div>
    </div>
  );
}
