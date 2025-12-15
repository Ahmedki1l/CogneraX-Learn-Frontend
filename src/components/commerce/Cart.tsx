import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Clock, 
  Users, 
  Star,
  BookOpen,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface CartProps {
  user: any;
}

export const Cart: React.FC<CartProps> = ({ user }) => {
  const { cartItems, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart();
  const { t, language, isRTL } = useLanguage();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handleRemoveItem = (courseId: string) => {
    removeFromCart(courseId);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success(t('cart.cartCleared', 'Cart cleared'));
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      toast.error(t('cart.selectPaymentMethod', 'Please select a payment method'));
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        toast.error(t('cart.fillCardDetails', 'Please fill in all card details'));
        return;
      }
    }

    setIsCheckingOut(true);

    try {
      // Create payment intent
      const paymentIntent = await api.payment.createPaymentIntent({
        amount: getTotalPrice(),
        currency: 'USD',
        items: cartItems.map(item => ({
          courseId: item.id,
          price: item.price
        }))
      });

      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      // Process payment
      const paymentResult = await api.payment.confirmPayment(paymentIntent.id, {
        paymentMethod: paymentMethod,
        cardDetails: paymentMethod === 'card' ? {
          number: cardNumber,
          expiry: expiryDate,
          cvv,
          name: cardholderName
        } : undefined
      });

      if (paymentResult) {
        // Enroll in courses
        for (const course of cartItems) {
          await api.payment.enrollFreeCourse(course.id);
        }

        // Clear cart
        clearCart();
        setShowCheckout(false);
        toast.success(t('cart.paymentSuccess', 'Payment successful! You are now enrolled in the courses.'));
      } else {
        throw new Error('Payment failed');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error?.message || t('cart.paymentError', 'Payment failed. Please try again.'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('cart.title', 'Shopping Cart')}
            </h1>
            <p className="text-gray-600">
              {t('cart.subtitle', 'Review and purchase your selected courses')}
            </p>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900">
              {t('cart.emptyTitle', 'Your cart is empty')}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {t('cart.emptyDescription', 'Browse our course catalog and add courses to your cart to get started.')}
            </p>
            <Button className="mt-4">
              <BookOpen className="h-4 w-4 mr-2" />
              {t('cart.browseCourses', 'Browse Courses')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('cart.title', 'Shopping Cart')}
            </h1>
            <p className="text-gray-600">
              {getTotalItems()} {getTotalItems() === 1 ? 'course' : 'courses'} in your cart
            </p>
          </div>
        </div>
        
        {cartItems.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('cart.clearCart', 'Clear Cart')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('common.by', 'By')} {course.instructor}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {course.field}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(course.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.studentsCount.toLocaleString()} students
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                        {course.rating}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t('cart.orderSummary', 'Order Summary')}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('cart.subtotal', 'Subtotal')}</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('cart.tax', 'Tax')}</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t('cart.total', 'Total')}</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-cognerax-gradient hover:opacity-90">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('cart.proceedToCheckout', 'Proceed to Checkout')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {t('cart.checkout', 'Checkout')}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">{t('cart.orderSummary')}</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>{getTotalItems()} {t('cart.courseCount')}</span>
                          <span>{formatPrice(getTotalPrice())}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>{t('cart.total')}</span>
                          <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="payment-method">{t('cart.paymentMethod')}</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('cart.selectPayment')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">{t('cart.creditDebitCard')}</SelectItem>
                          <SelectItem value="paypal">{t('cart.paypal')}</SelectItem>
                          <SelectItem value="wallet">{t('cart.digitalWallet')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="cardholder-name">{t('cart.cardholderName')}</Label>
                          <Input
                            id="cardholder-name"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="card-number">{t('cart.cardNumber')}</Label>
                          <Input
                            id="card-number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiry">{t('cart.expiryDate')}</Label>
                            <Input
                              id="expiry"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">{t('cart.cvv')}</Label>
                            <Input
                              id="cvv"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="123"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-cognerax-gradient hover:opacity-90"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Complete Purchase
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="text-xs text-gray-500 text-center">
                {t('cart.secureCheckout', 'Secure checkout powered by CogneraX')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};