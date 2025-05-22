
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, Search, Eye, Package } from 'lucide-react';
import Image from 'next/image';
import type { Product, SiteCategory } from '@/types'; // Updated to import SiteCategory
import { categoryIcons } from '@/types';
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
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const productsCollectionRef = collection(db, 'products');
    const q = query(productsCollectionRef, orderBy("name", "asc")); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedProducts: Product[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Product, 'id'>
      }));
      setProducts(fetchedProducts);
      setIsLoading(false);
    }, (error) => {
      console.error("Erreur de récupération des produits (snapshot):", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les produits en temps réel." });
      setIsLoading(false);
    });

    return () => unsubscribe(); 
  }, [toast]);

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
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({ title: "Produit supprimé", description: `Le produit "${productName}" a été supprimé de Firestore.` });
    } catch (error: any) {
      console.error("Erreur de suppression du produit:", error);
      toast({ variant: "destructive", title: "Erreur", description: `Impossible de supprimer le produit. ${error.message}` });
    }
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    try {
      if (editingProduct && editingProduct.id) {
        const productDocRef = doc(db, 'products', editingProduct.id);
        const dataToUpdate: Partial<Product> = { ...(productData as Product) };
        // Ensure 'id' is not part of the update payload itself, it's in the doc ref.
        if ('id' in dataToUpdate) delete (dataToUpdate as any).id;
        
        await updateDoc(productDocRef, dataToUpdate);
        toast({ title: "Produit modifié", description: `${productData.name} a été mis à jour dans Firestore.` });
      } else {
        await addDoc(collection(db, 'products'), productData as Omit<Product, 'id'>);
        toast({ title: "Produit ajouté", description: `${productData.name} a été ajouté à Firestore.` });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Erreur détaillée de sauvegarde du produit:", error);
      console.error("Détails de l'erreur Firestore:", error.code, error.message);
      toast({ variant: "destructive", title: "Erreur de Sauvegarde", description: `Impossible de sauvegarder le produit. Erreur: ${error.message}` });
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Chargement des produits...</p></div>;
  }

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
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image src={product.imageUrl || 'https://placehold.co/100x100.png'} alt={product.name} fill sizes="50px" className="object-cover" data-ai-hint={product.imageAiHint || "product thumbnail"}/>
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
                                      Êtes-vous sûr de vouloir supprimer le produit "{product.name}" ? Cette action est irréversible.
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
                    Aucun produit trouvé dans Firestore. Commencez par en ajouter un !
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
