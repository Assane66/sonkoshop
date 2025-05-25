
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // CardTitle removed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, Search, Eye, Package, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Product, SiteCategory, ProductCategoryEnum as CatEnum } from '@/types'; 
import { categoryIcons, productCategoriesArray } from '@/types'; // Using static categories array
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
// Firebase imports removed
// import { db } from '@/lib/firebase';
// import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Initial mock products
const initialMockProducts: Product[] = [
  { id: '1', name: 'Maillot Domicile Sénégal 2024', description: 'Authentique maillot des Lions de la Téranga.', price: 35000, category: CatEnum.Maillots, imageUrl: 'https://placehold.co/300x300.png?text=Maillot+Senegal', stock: 50, sizes: ['S', 'M', 'L', 'XL'], featured: true, imageAiHint: 'senegal jersey' },
  { id: '2', name: 'Chaussures de Foot Pro Model', description: 'Pour des performances optimales sur le terrain.', price: 65000, category: CatEnum.Chaussures, imageUrl: 'https://placehold.co/300x300.png?text=Foot+Shoes', stock: 30, sizes: ['40', '41', '42', '43', '44'], imageAiHint: 'soccer cleats' },
  { id: '3', name: 'Pantalon de Survêtement Club', description: 'Confortable et stylé pour l_entraînement.', price: 22000, category: CatEnum.Pantalons, imageUrl: 'https://placehold.co/300x300.png?text=Training+Pants', stock: 0, sizes: ['M', 'L'], imageAiHint: 'track pants' },
];

// Mock categories for the ProductForm, assuming they are managed locally in AdminCategoriesPage
const mockSiteCategories: SiteCategory[] = productCategoriesArray.map((catName, index) => ({
  id: (index + 1).toString(),
  name: catName,
  iconName: catName as keyof typeof categoryIcons, // Assuming icon names match category names
}));


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialMockProducts);
  // const [isLoading, setIsLoading] = useState(true); // No Firebase loading
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  // useEffect for Firebase snapshot removed

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({ title: "Produit supprimé (local)", description: `Le produit "${productName}" a été supprimé localement.` });
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    if (editingProduct && editingProduct.id && 'id' in productData) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      toast({ title: "Produit modifié (local)", description: `${productData.name} a été mis à jour localement.` });
    } else {
      const newProduct: Product = { id: Date.now().toString(), ...(productData as Omit<Product, 'id'>) };
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "Produit ajouté (local)", description: `${productData.name} a été ajouté localement.` });
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };
  
  // if (isLoading) { // No Firebase loading
  //   return <div className="flex justify-center items-center h-64"><p>Chargement des produits...</p></div>;
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestion des Produits</h1>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingProduct(null);}}>
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
              categories={mockSiteCategories} // Pass local categories
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
                const CategoryIcon = product.category ? categoryIcons[product.category as keyof typeof categoryIcons] || Package : Package;
                const displayImageUrl = product.imageUrl && product.imageUrl.trim() !== '' ? product.imageUrl : 'https://placehold.co/100x100.png';
                const displayImageAiHint = product.imageUrl && product.imageUrl.trim() !== '' ? (product.imageAiHint || "product thumbnail") : 'placeholder image';

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image src={displayImageUrl} alt={product.name} fill sizes="50px" className="object-cover" data-ai-hint={displayImageAiHint}/>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/products/${product.id}`} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1">
                        {product.name} <Eye className="h-4 w-4 opacity-50"/>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">
                          {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                          {product.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{product.price.toLocaleString('fr-FR')}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className={product.stock > 0 && product.stock <= 10 ? 'bg-yellow-500 text-black' : ''}>
                        {product.stock > 0 ? product.stock : 'Épuisé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-1"> 
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
                                      Êtes-vous sûr de vouloir supprimer le produit "{product.name}" ?
                                  </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={() => handleDeleteProduct(product.id, product.name)}>
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
                    Aucun produit trouvé. Commencez par en ajouter un !
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
