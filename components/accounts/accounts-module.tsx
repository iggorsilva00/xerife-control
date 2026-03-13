'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard as CreditCardIcon, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getAccounts, createAccount, deleteAccount } from '@/lib/services/account-service';
import { getCards, createCard, deleteCard } from '@/lib/services/card-service';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountsSkeleton, EmptyState } from '@/components/ui/skeleton-cards';

export function AccountsModule() {
  const { currency } = useApp();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'corrente' as any,
    initialBalance: '0'
  });

  const [cardForm, setCardForm] = useState({
    name: '',
    limit: '0',
    dueDate: '10'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [accs, crds] = await Promise.all([getAccounts(), getCards()]);
    setAccounts(accs);
    setCards(crds);
    setLoading(false);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    await createAccount(
      accountForm.name,
      accountForm.type,
      parseFloat(accountForm.initialBalance)
    );
    setAccountForm({ name: '', type: 'corrente', initialBalance: '0' });
    setShowAccountForm(false);
    loadData();
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    await createCard(
      cardForm.name,
      parseFloat(cardForm.limit),
      parseInt(cardForm.dueDate)
    );
    setCardForm({ name: '', limit: '0', dueDate: '10' });
    setShowCardForm(false);
    loadData();
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Contas e Cartões</h2>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões de crédito</p>
        </div>
        <AccountsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contas e Cartões</h2>
        <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões de crédito</p>
      </div>

      {/* Summary Card */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalBalance, currency)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contas</h3>
          <Button onClick={() => setShowAccountForm(!showAccountForm)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Conta
          </Button>
        </div>

        {showAccountForm && (
          <Card className="mb-4 p-4">
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <Label>Nome da Conta</Label>
                <Input
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="Ex: Nubank"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={accountForm.type} onValueChange={(v: any) => setAccountForm({ ...accountForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Poupança</SelectItem>
                      <SelectItem value="carteira">Carteira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Saldo Inicial</Label>
                  <Input type="number" step="0.01" value={accountForm.initialBalance}
                    onChange={(e) => setAccountForm({ ...accountForm, initialBalance: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Criar</Button>
                <Button type="button" variant="outline" onClick={() => setShowAccountForm(false)}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {accounts.length === 0 && !showAccountForm ? (
          <EmptyState
            icon={<WalletIcon className="w-8 h-8" />}
            title="Nenhuma conta cadastrada"
            description="Adicione suas contas bancárias para controlar o saldo e associar lançamentos."
            action={<Button onClick={() => setShowAccountForm(true)} className="gap-2"><Plus className="w-4 h-4" />Adicionar conta</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(acc => (
              <Card key={acc.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-5 h-5" />
                    <CardTitle className="text-base">{acc.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{formatCurrency(acc.currentBalance, currency)}</div>
                  <p className="text-xs text-muted-foreground capitalize">{acc.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Cartões de Crédito</h3>
          <Button onClick={() => setShowCardForm(!showCardForm)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Cartão
          </Button>
        </div>

        {showCardForm && (
          <Card className="mb-4 p-4">
            <form onSubmit={handleCreateCard} className="space-y-3">
              <div>
                <Label>Nome do Cartão</Label>
                <Input value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder="Ex: Mastercard" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Limite Total</Label>
                  <Input type="number" step="0.01" value={cardForm.limit}
                    onChange={(e) => setCardForm({ ...cardForm, limit: e.target.value })} />
                </div>
                <div>
                  <Label>Dia Vencimento</Label>
                  <Input type="number" min="1" max="31" value={cardForm.dueDate}
                    onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Criar</Button>
                <Button type="button" variant="outline" onClick={() => setShowCardForm(false)}>Cancelar</Button>
              </div>
            </form>
          </Card>
        )}

        {cards.length === 0 && !showCardForm ? (
          <EmptyState
            icon={<CreditCardIcon className="w-8 h-8" />}
            title="Nenhum cartão cadastrado"
            description="Adicione seus cartões de crédito para acompanhar a fatura e o limite disponível."
            action={<Button onClick={() => setShowCardForm(true)} className="gap-2"><Plus className="w-4 h-4" />Adicionar cartão</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(card => {
              const available = card.limit - card.currentBill;
              const usagePercent = (card.currentBill / card.limit) * 100;
              return (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5" />
                      <CardTitle className="text-base">{card.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Fatura Atual</p>
                        <p className="text-xl font-bold">{formatCurrency(card.currentBill, currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Disponível</p>
                        <p className="text-lg">{formatCurrency(available, currency)}</p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">Vencimento dia {card.dueDate}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
