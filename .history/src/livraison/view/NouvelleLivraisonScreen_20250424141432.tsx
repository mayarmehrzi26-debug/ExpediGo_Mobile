import React, { useState, useEffect } from 'react';
import { LivraisonPresenter } from '../presenters/LivraisonPresenter';
import { Livraison, DropdownOption } from '../models/Livraison';
import { Form, Input, Button, Select, Checkbox, InputNumber, message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const NouvelleScreenView: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [payments, setPayments] = useState<DropdownOption[]>([]);
  const [isFragile, setIsFragile] = useState(false);
  const [isExchange, setIsExchange] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [clientsData, productsData, paymentsData] = await Promise.all([
          LivraisonPresenter.getDropdownOptions('clients', 'name'),
          LivraisonPresenter.getDropdownOptions('products', 'name', ['price']),
          LivraisonPresenter.getDropdownOptions('payments', 'method')
        ]);
        
        setClients(clientsData);
        setProducts(productsData);
        setPayments(paymentsData);
      } catch (error) {
        message.error('Erreur lors du chargement des données');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const newDelivery: Omit<Livraison, 'id' | 'qrCodeUrl' | 'createdAt' | 'status'> = {
        address: values.address,
        client: values.client,
        product: values.product,
        payment: values.payment,
        isExchange: values.isExchange || false,
        isFragile: values.isFragile || false,
        termsAccepted: values.termsAccepted,
        quantity: values.quantity,
        totalAmount: calculateTotal(values.product, values.quantity),
        createdAt: new Date(), // Será ajouté par le presenter
        status: 'pending', // Será ajouté par le presenter
        qrCodeUrl: '' // Será généré par le presenter
      };

      const createdDelivery = await LivraisonPresenter.createNewDelivery(newDelivery);
      
      message.success('Livraison créée avec succès!');
      console.log('QR Code URL:', createdDelivery.qrCodeUrl);
      form.resetFields();
      
    } catch (error) {
      message.error('Erreur lors de la création de la livraison');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (productId: string, quantity: number): number => {
    const product = products.find(p => p.value === productId);
    return product?.price ? product.price * quantity : 0;
  };

  const onProductChange = (value: string) => {
    const product = products.find(p => p.value === value);
    form.setFieldsValue({ totalAmount: product?.price ? product.price * form.getFieldValue('quantity') : 0 });
  };

  const onQuantityChange = (value: number) => {
    const productId = form.getFieldValue('product');
    const product = products.find(p => p.value === productId);
    form.setFieldsValue({ totalAmount: product?.price ? product.price * value : 0 });
  };

  return (
    <div className="livraison-container">
      <h1>Nouvelle Livraison</h1>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ quantity: 1, isFragile: false, isExchange: false }}
      >
        {/* Client */}
        <Form.Item
          name="client"
          label="Client"
          rules={[{ required: true, message: 'Veuillez sélectionner un client' }]}
        >
          <Select loading={loading} placeholder="Sélectionnez un client">
            {clients.map(client => (
              <Option key={client.value} value={client.value}>
                {client.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Adresse */}
        <Form.Item
          name="address"
          label="Adresse de livraison"
          rules={[{ required: true, message: 'Veuillez saisir une adresse' }]}
        >
          <TextArea rows={3} placeholder="Adresse complète" />
        </Form.Item>

        {/* Produit */}
        <Form.Item
          name="product"
          label="Produit"
          rules={[{ required: true, message: 'Veuillez sélectionner un produit' }]}
        >
          <Select 
            loading={loading} 
            placeholder="Sélectionnez un produit"
            onChange={onProductChange}
          >
            {products.map(product => (
              <Option key={product.value} value={product.value}>
                {product.label} - {product.price}€
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Quantité */}
        <Form.Item
          name="quantity"
          label="Quantité"
          rules={[{ required: true, message: 'Veuillez saisir la quantité' }]}
        >
          <InputNumber 
            min={1} 
            max={100} 
            onChange={onQuantityChange}
          />
        </Form.Item>

        {/* Montant Total */}
        <Form.Item
          name="totalAmount"
          label="Montant Total (€)"
        >
          <InputNumber disabled />
        </Form.Item>

        {/* Mode de paiement */}
        <Form.Item
          name="payment"
          label="Mode de paiement"
          rules={[{ required: true, message: 'Veuillez sélectionner un mode de paiement' }]}
        >
          <Select loading={loading} placeholder="Sélectionnez un mode de paiement">
            {payments.map(payment => (
              <Option key={payment.value} value={payment.value}>
                {payment.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Options */}
        <Form.Item name="isFragile" valuePropName="checked">
          <Checkbox onChange={e => setIsFragile(e.target.checked)}>
            Produit fragile
          </Checkbox>
        </Form.Item>

        <Form.Item name="isExchange" valuePropName="checked">
          <Checkbox onChange={e => setIsExchange(e.target.checked)}>
            Échange demandé
          </Checkbox>
        </Form.Item>

        {/* Conditions */}
        <Form.Item
          name="termsAccepted"
          valuePropName="checked"
          rules={[{ required: true, message: 'Vous devez accepter les conditions' }]}
        >
          <Checkbox>
            J'accepte les conditions générales de livraison
          </Checkbox>
        </Form.Item>

        {/* Bouton de soumission */}
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            disabled={loading}
          >
            Créer la livraison
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NouvelleScreenView;