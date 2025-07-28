"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  ChevronDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

import { FichasTable } from '@/components/fichas-table';
import { AddFichaDialog } from '@/components/add-ficha-dialog';
import { fichas as initialFichas, customers as initialCustomers } from '@/lib/data';
import type { Ficha, Customer } from '@/lib/types';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Dashboard() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    setFichas(initialFichas);
    setCustomers(initialCustomers);
  }, []);

  const handleAddFicha = (newFicha: Omit<Ficha, 'id' | 'creationDate'>) => {
    const ficha: Ficha = {
      ...newFicha,
      id: `F${String(fichas.length + 1).padStart(3, '0')}`,
      creationDate: new Date(),
    };
    setFichas((prev) => [ficha, ...prev]);

    if (!customers.some((c) => c.code === ficha.customerCode)) {
      setCustomers((prev) => [
        ...prev,
        { code: ficha.customerCode, name: ficha.customerName },
      ]);
    }
  };

  const updateFicha = (updatedFicha: Ficha) => {
    setFichas(fichas.map(f => f.id === updatedFicha.id ? updatedFicha : f));
  };
  
  const deleteFicha = (fichaId: string) => {
    setFichas(fichas.filter(f => f.id !== fichaId));
  }

  const filteredFichas = useMemo(() => {
    if (!date) return fichas;
    const selectedDate = new Date(date.setHours(0, 0, 0, 0));
    return fichas.filter((ficha) => {
      const fichaDate = new Date(ficha.creationDate.setHours(0, 0, 0, 0));
      return fichaDate.getTime() === selectedDate.getTime();
    });
  }, [fichas, date]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background sm:px-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold md:text-xl">Controle de Fichas</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <AddFichaDialog customers={customers} onAddFicha={handleAddFicha} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="hidden md:inline">usuário@email.com</span>
                <span className="md:hidden">Conta</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login">Sair</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Fichas do Dia</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full sm:w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, 'PPP', { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <FichasTable fichas={filteredFichas} onUpdateFicha={updateFicha} onDeleteFicha={deleteFicha} />
        </div>
      </main>
    </div>
  );
}
