'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, Trash2, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/lib/types';
import {
  getGoals,
  createGoal,
  deleteGoal,
  addToGoal,
  getGoalProgress,
  getGoalDaysLeft,
} from '@/lib/services/goal-service';
import { useApp } from '@/lib/contexts/app-context';
import { formatCurrency } from '@/lib/utils/currency';
import { EmptyState } from '@/components/ui/skeleton-cards';

const GOAL_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export function GoalsModule() {
  const { currency } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    color: GOAL_COLORS[0],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    const data = await getGoals();
    setGoals(data.filter((g) => g.status !== 'cancelada'));
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;

    await createGoal({
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
      color: form.color,
      status: 'em_andamento',
    });

    setForm({ name: '', targetAmount: '', currentAmount: '0', deadline: '', color: GOAL_COLORS[0] });
    setShowForm(false);
    loadGoals();
  }

  async function handleAddAmount(goalId: string) {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;
    await addToGoal(goalId, amount);
    setAddingTo(null);
    setAddAmount('');
    loadGoals();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta meta?')) return;
    await deleteGoal(id);
    loadGoals();
  }

  const active = goals.filter((g) => g.status === 'em_andamento');
  const completed = goals.filter((g) => g.status === 'concluida');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metas Financeiras</h2>
          <p className="text-muted-foreground">Acompanhe seus objetivos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Meta</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nome da meta</Label>
                  <Input
                    placeholder="Ex: Viagem para Europa"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Valor alvo (R$)</Label>
                  <Input
                    type="number"
                    placeholder="5000.00"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Já tenho (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.currentAmount}
                    onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Prazo (opcional)</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-1">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        form.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit">Criar Meta</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </Card>
          ))}
        </div>
      ) : active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="Nenhuma meta criada"
          description="Crie metas financeiras para acompanhar seus objetivos, como uma viagem, reserva de emergência ou compra planejada."
          action={
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeira meta
            </Button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Em andamento ({active.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currency={currency}
                    isAdding={addingTo === goal.id}
                    addAmount={addAmount}
                    onStartAdd={() => { setAddingTo(goal.id); setAddAmount(''); }}
                    onAddAmount={() => handleAddAmount(goal.id)}
                    onCancelAdd={() => setAddingTo(null)}
                    onAddAmountChange={setAddAmount}
                    onDelete={() => handleDelete(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Concluídas ({completed.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currency={currency}
                    isAdding={false}
                    addAmount=""
                    onStartAdd={() => {}}
                    onAddAmount={() => {}}
                    onCancelAdd={() => {}}
                    onAddAmountChange={() => {}}
                    onDelete={() => handleDelete(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  currency: string;
  isAdding: boolean;
  addAmount: string;
  onStartAdd: () => void;
  onAddAmount: () => void;
  onCancelAdd: () => void;
  onAddAmountChange: (v: string) => void;
  onDelete: () => void;
}

function GoalCard({
  goal, currency, isAdding, addAmount,
  onStartAdd, onAddAmount, onCancelAdd, onAddAmountChange, onDelete,
}: GoalCardProps) {
  const progress = getGoalProgress(goal);
  const daysLeft = getGoalDaysLeft(goal);
  const isCompleted = goal.status === 'concluida';

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Color stripe */}
      <div className="h-1.5" style={{ backgroundColor: goal.color }} />

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold">{goal.name}</h4>
            {daysLeft !== null && !isCompleted && (
              <span className={`text-xs ${
                daysLeft < 0 ? 'text-red-500' :
                daysLeft <= 3 ? 'text-amber-500' : 'text-muted-foreground'
              }`}>
                {daysLeft < 0
                  ? `Atrasado ${Math.abs(daysLeft)} dia(s)`
                  : daysLeft === 0
                  ? 'Vence hoje'
                  : `${daysLeft} dias restantes`}
              </span>
            )}
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium">✓ Concluída</span>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={onDelete} className="w-7 h-7 text-muted-foreground hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">
              {formatCurrency(goal.currentAmount, currency as any)}
            </span>
            <span className="font-medium">
              {formatCurrency(goal.targetAmount, currency as any)}
            </span>
          </div>
          <Progress value={progress} className="h-2" style={{ '--progress-color': goal.color } as any} />
          <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(progress)}%</p>
        </div>

        {/* Add amount */}
        {!isCompleted && (
          isAdding ? (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Valor a adicionar"
                value={addAmount}
                onChange={(e) => onAddAmountChange(e.target.value)}
                min="0.01"
                step="0.01"
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && onAddAmount()}
              />
              <Button size="sm" onClick={onAddAmount} className="h-8 px-3">
                OK
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelAdd} className="h-8 px-3">
                ✕
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartAdd}
              className="w-full gap-1.5 text-xs h-8"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Adicionar valor
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
