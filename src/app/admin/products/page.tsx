
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, Search, Eye, Package, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types';
import { ProductCategoryEnum, categoryIcons } from '@/types'; 
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ProductForm from '@/components/admin/ProductForm'; 
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const initialProducts: Product[] = [
  { id: '1', name: 'Maillot Sénégal Authentique 2024', description: 'Portez les couleurs des Lions avec fierté.', price: 45000, category: ProductCategoryEnum.Maillots, imageUrl: 'https://placehold.co/400x400.png', stock: 50, imageAiHint: 'senegal football jersey', sizes: ['S', 'M', 'L'] },
  { id: '2', name: 'Chaussures de Foot "Vitesse Ultime"', description: 'Légères et réactives pour des accélérations explosives.', price: 62000, category: ProductCategoryEnum.Chaussures, imageUrl: 'https://placehold.co/400x400.png', stock: 30, imageAiHint: 'soccer cleats dynamic', sizes: ['40', '41', '42'] },
  { id: '3', name: 'Pantalon d\'Entraînement Pro', description: 'Confort thermique et liberté de mouvement.', price: 28000, category: ProductCategoryEnum.Pantalons, imageUrl: 'https://placehold.co/400x400.png', stock: 0, imageAiHint: 'training pants athlete', sizes: ['M', 'L'] },
];


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would call an API
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({ title: "Produit supprimé", description: "Le produit a été retiré de la liste (simulation)." });
  };

  const handleFormSubmit = (productData: Product) => {
    if (editingProduct) {
      // Update existing product (simulation)
      setProducts(prev => prev.map(p => (p.id === productData.id ? productData : p)));
      toast({ title: "Produit modifié", description: `${productData.name} a été mis à jour.` });
    } else {
      // Add new product (simulation)
      const newProduct = { ...productData, id: (Math.random() * 10000).toString() }; // temp ID
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "Produit ajouté", description: `${newProduct.name} a été ajouté avec succès.` });
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Produits</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Mettez à jour les informations du produit.' : 'Remplissez les détails du nouveau produit.'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              product={editingProduct} 
              onSubmit={handleFormSubmit} 
              onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="relative">
            <Input
              type="search"
              placeholder="Rechercher par nom, catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/3"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix (FCFA)</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const CategoryIcon = categoryIcons[product.category] || Package;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image src={product.imageUrl} alt={product.name} fill sizes="50px" className="object-cover" data-ai-hint={product.imageAiHint || "product thumbnail"}/>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/products/${product.id}`} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1">
                        {product.name} <Eye className="h-4 w-4 opacity-50"/>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">
                        {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{product.price.toLocaleString('fr-FR')}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className={product.stock > 0 && product.stock <= 10 ? 'bg-yellow-500 text-black' : ''}>
                        {product.stock > 0 ? product.stock : 'Épuisé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} title="Modifier">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                       <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title="Supprimer">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Confirmer la suppression</DialogTitle>
                                  <DialogDescription>
                                      Êtes-vous sûr de vouloir supprimer le produit "{product.name}" ? Cette action est irréversible.
                                  </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                                      Supprimer
                                  </Button>
                              </DialogFooter>
                          </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
