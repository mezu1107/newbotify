"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Plus, Trash2, CheckCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

interface WalletAddress {
  _id: string
  label: string
  chain: string
  address: string
  createdAt: string
  verified?: boolean
}

export default function EWalletPage() {
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<WalletAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // Add address form state
  const [addForm, setAddForm] = useState({
    label: "",
    chain: "",
    address: "",
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, addressesRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/e-wallet/addresses")])

      if (userRes.ok && addressesRes.ok) {
        const userData = await userRes.json()
        const addressesData = await addressesRes.json()
        setUser(userData.user)
        setAddresses(addressesData.addresses)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError("")
    setAddSuccess("")

    try {
      const response = await fetch("/api/e-wallet/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      })

      const data = await response.json()

      if (response.ok) {
        setAddSuccess(t("ewallet.add.success", "Wallet address added successfully!"))
        setAddForm({ label: "", chain: "", address: "" })
        setShowAddForm(false)
        fetchData()
      } else {
        setAddError(data.error || t("ewallet.add.error", "Failed to add address"))
      }
    } catch (err) {
      setAddError(t("ewallet.add.error_network", "Network error. Please try again."))
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(t("ewallet.delete.confirm", "Are you sure you want to delete this address?"))) return

    try {
      const response = await fetch(`/api/e-wallet/addresses/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      } else {
        alert(t("ewallet.delete.error", "Failed to delete address"))
      }
    } catch (error) {
      alert(t("ewallet.delete.error_network", "Network error. Please try again."))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />

      <main className="flex-1 w-full min-w-0 overflow-auto">
        <div className="w-full max-w-none p-6 md:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-balance">{t("ewallet.title", "E-Wallet")}</h1>
            <p className="text-muted-foreground">{t("ewallet.subtitle", "Manage your external wallet addresses")}</p>
          </div>

          <div className="space-y-6">
            {/* Add Address Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t("ewallet.addresses.title", "Wallet Addresses")}</h2>
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("ewallet.add.cta", "Add Address")}
              </Button>
            </div>

            {/* Add Address Form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("ewallet.add.title", "Add New Wallet Address")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    {addError && (
                      <Alert variant="destructive">
                        <AlertDescription>{addError}</AlertDescription>
                      </Alert>
                    )}

                    {addSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{addSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="label">{t("ewallet.add.label", "Label")}</Label>
                        <Input
                          id="label"
                          type="text"
                          placeholder={t("ewallet.add.placeholder.label", "e.g., My Main Wallet")}
                          value={addForm.label}
                          onChange={(e) => setAddForm((prev) => ({ ...prev, label: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chain">{t("ewallet.add.chain", "Blockchain")}</Label>
                        <Input
                          id="chain"
                          type="text"
                          placeholder={t("ewallet.add.placeholder.chain", "e.g., Ethereum, BSC, TRON")}
                          value={addForm.chain}
                          onChange={(e) => setAddForm((prev) => ({ ...prev, chain: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">{t("ewallet.add.address", "Wallet Address")}</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder={t("ewallet.add.placeholder.address", "Enter wallet address")}
                        value={addForm.address}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={addLoading}>
                        {addLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("ewallet.add.submitting", "Adding...")}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("ewallet.add.cta", "Add Address")}
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        {t("ewallet.add.cancel", "Cancel")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Addresses List */}
            <div className="grid gap-4">
              {addresses.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("ewallet.empty.title", "No wallet addresses")}</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {t("ewallet.empty.subtitle", "Add your external wallet addresses to manage withdrawals and deposits.")}
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("ewallet.empty.cta", "Add Your First Address")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                addresses.map((address) => (
                  <Card key={address._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{address.label}</h3>
                            {address.verified && (
                              <Badge variant="default" className="text-xs">
                                {t("ewallet.address.verified", "Verified")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>{t("ewallet.address.chain", "Chain:")}</strong> {address.chain}
                          </p>
                          <p className="text-sm font-mono bg-muted p-2 rounded break-all">{address.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("ewallet.address.added_on", "Added on ")}
                            {new Date(address.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
