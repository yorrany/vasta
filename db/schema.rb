# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_01_15_003200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "appointments", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "offer_id", null: false
    t.bigint "profile_id", null: false
    t.datetime "starts_at", null: false
    t.integer "duration_minutes", null: false
    t.string "status", default: "scheduled", null: false
    t.string "client_name"
    t.string "client_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["offer_id"], name: "index_appointments_on_offer_id"
    t.index ["profile_id"], name: "index_appointments_on_profile_id"
    t.index ["tenant_id"], name: "index_appointments_on_tenant_id"
  end

  create_table "audit_logs", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "user_id"
    t.string "action", null: false
    t.string "resource_type"
    t.bigint "resource_id"
    t.jsonb "changeset", default: {}, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "created_at"], name: "index_audit_logs_on_tenant_id_and_created_at"
    t.index ["tenant_id"], name: "index_audit_logs_on_tenant_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "checkouts", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "offer_id", null: false
    t.string "stripe_session_id", null: false
    t.string "stripe_payment_intent_id"
    t.string "status", default: "pending", null: false
    t.integer "amount_cents", null: false
    t.string "currency", default: "BRL", null: false
    t.jsonb "raw_data", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["offer_id"], name: "index_checkouts_on_offer_id"
    t.index ["stripe_payment_intent_id"], name: "index_checkouts_on_stripe_payment_intent_id"
    t.index ["stripe_session_id"], name: "index_checkouts_on_stripe_session_id", unique: true
    t.index ["tenant_id"], name: "index_checkouts_on_tenant_id"
  end

  create_table "feature_flags", force: :cascade do |t|
    t.string "key", null: false
    t.string "description"
    t.boolean "enabled_by_default", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_feature_flags_on_key", unique: true
  end

  create_table "offers", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "profile_id", null: false
    t.string "title", null: false
    t.text "description"
    t.integer "price_cents", null: false
    t.string "currency", default: "BRL", null: false
    t.string "kind", default: "digital_product", null: false
    t.boolean "active", default: true, null: false
    t.integer "position"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["profile_id"], name: "index_offers_on_profile_id"
    t.index ["tenant_id"], name: "index_offers_on_tenant_id"
  end

  create_table "profiles", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "user_id"
    t.string "slug", null: false
    t.string "display_name", null: false
    t.text "bio"
    t.jsonb "theme_config", default: {}, null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_profiles_on_slug", unique: true
    t.index ["tenant_id"], name: "index_profiles_on_tenant_id"
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "service_availabilities", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "offer_id", null: false
    t.integer "weekday", null: false
    t.integer "start_minute", null: false
    t.integer "end_minute", null: false
    t.integer "duration_minutes", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["offer_id"], name: "index_service_availabilities_on_offer_id"
    t.index ["tenant_id"], name: "index_service_availabilities_on_tenant_id"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "external_id", null: false
    t.string "plan_code", null: false
    t.string "status", null: false
    t.datetime "current_period_end"
    t.jsonb "raw_data", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["external_id"], name: "index_subscriptions_on_external_id", unique: true
    t.index ["tenant_id"], name: "index_subscriptions_on_tenant_id"
  end

  create_table "tenant_feature_flags", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.bigint "feature_flag_id", null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["feature_flag_id"], name: "index_tenant_feature_flags_on_feature_flag_id"
    t.index ["tenant_id", "feature_flag_id"], name: "index_tenant_feature_flags_on_tenant_and_flag", unique: true
    t.index ["tenant_id"], name: "index_tenant_feature_flags_on_tenant_id"
  end

  create_table "tenants", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "current_plan_code", default: "start", null: false
    t.string "billing_status", default: "active", null: false
    t.datetime "blocked_at"
    t.string "stripe_customer_id"
    t.index ["slug"], name: "index_tenants_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.bigint "tenant_id", null: false
    t.string "name", null: false
    t.string "email", null: false
    t.string "role", default: "admin", null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id", "email"], name: "index_users_on_tenant_id_and_email", unique: true
    t.index ["tenant_id"], name: "index_users_on_tenant_id"
  end

  add_foreign_key "appointments", "offers"
  add_foreign_key "appointments", "profiles"
  add_foreign_key "appointments", "tenants"
  add_foreign_key "audit_logs", "tenants"
  add_foreign_key "audit_logs", "users"
  add_foreign_key "checkouts", "offers"
  add_foreign_key "checkouts", "tenants"
  add_foreign_key "offers", "profiles"
  add_foreign_key "offers", "tenants"
  add_foreign_key "profiles", "tenants"
  add_foreign_key "profiles", "users"
  add_foreign_key "service_availabilities", "offers"
  add_foreign_key "service_availabilities", "tenants"
  add_foreign_key "subscriptions", "tenants"
  add_foreign_key "tenant_feature_flags", "feature_flags"
  add_foreign_key "tenant_feature_flags", "tenants"
  add_foreign_key "users", "tenants"
end
