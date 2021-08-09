import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get<Stock>(`stock/${productId}`);
      if (stock.amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const { data: product } = await api.get<Product>(`products/${productId}`);
      const productInCart = cart.find(product => product.id === productId);

      if (productInCart) {
        if (productInCart.amount + 1 > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
        } else {
          const newCart = cart.map(product => {
            return {
              ...product,
              amount: product.id === productId ? product.amount + 1 : product.amount
            }
          })
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...newCart]));
          setCart([...newCart])
        }
      } else {
        const newProduct = {
          ...product,
          amount: 1
        }
        setCart([...cart, newProduct])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, newProduct]));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      if (storagedCart) {
        const productsStoraged: Product[] = JSON.parse(storagedCart);
        const productIndex = productsStoraged.findIndex(product => product.id === productId);
        productsStoraged.splice(productIndex, 1);
        setCart([...productsStoraged]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productsStoraged));
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
