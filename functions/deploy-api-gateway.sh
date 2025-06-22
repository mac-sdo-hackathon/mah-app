#!/bin/bash

# API Gateway デプロイスクリプト（認証なし）
# Meeting App用 Google Cloud API Gateway デプロイメント

set -e  # エラーが発生した場合にスクリプトを停止

# 色付きログ用の関数
log_info() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

log_warning() {
    echo -e "\033[0;33m[WARNING]\033[0m $1"
}

# 必要な環境変数のチェック
check_env_vars() {
    log_info "環境変数をチェックしています..."

    local required_vars=(
        "PROJECT_ID"
        "API_ID"
        "CONFIG_ID"
        "GATEWAY_ID"
        "GCP_REGION"
        "CLOUD_RUN_SERVICE_URL"
        "SERVICE_ACCOUNT"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            log_error "環境変数 $var が設定されていません"
            exit 1
        fi
    done

    log_success "すべての環境変数が設定されています"
}

# gcloud認証チェック
check_gcloud_auth() {
    log_info "gcloud認証をチェックしています..."

    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "gcloudにログインしていません"
        log_info "次のコマンドでログインしてください: gcloud auth login"
        exit 1
    fi

    log_success "gcloud認証が確認されました"
}

# プロジェクト設定
set_project() {
    log_info "プロジェクトを設定しています: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    log_success "プロジェクトが設定されました"
}

# 必要なAPIを有効化
enable_apis() {
    log_info "必要なAPIを有効化しています..."

    local apis=(
        "apigateway.googleapis.com"
        "servicemanagement.googleapis.com"
        "servicecontrol.googleapis.com"
    )

    for api in "${apis[@]}"; do
        log_info "APIを有効化中: $api"
        gcloud services enable "$api" --project="$PROJECT_ID"
    done

    log_success "すべてのAPIが有効化されました"
}

# サービスアカウントの権限チェック
check_service_account() {
    log_info "サービスアカウントの権限をチェックしています..."

    # サービスアカウントが存在するかチェック
    if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project="$PROJECT_ID" &>/dev/null; then
        log_error "サービスアカウント $SERVICE_ACCOUNT が見つかりません"
        exit 1
    fi

    log_success "サービスアカウントが確認されました"
}

# OpenAPI仕様ファイルの更新
update_openapi_spec() {
    log_info "OpenAPI仕様ファイルを更新しています..."

    # スクリプトのディレクトリに移動
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$script_dir"

    # OpenAPI仕様ファイルの存在確認
    if [[ ! -f "openapi-spec.yaml" ]]; then
        log_error "openapi-spec.yaml ファイルが見つかりません"
        log_error "現在のディレクトリ: $(pwd)"
        exit 1
    fi

    # 一時ファイルを作成してCloud Run URLを設定
    sed "s|YOUR_CLOUD_RUN_SERVICE_URL|$CLOUD_RUN_SERVICE_URL|g" openapi-spec.yaml > openapi-spec-deploy.yaml

    log_success "OpenAPI仕様ファイルが更新されました（認証なし設定）"
}

# APIを作成
create_api() {
    log_info "APIを作成しています: $API_ID"

    # APIが既に存在するかチェック
    if gcloud api-gateway apis describe "$API_ID" --project="$PROJECT_ID" &>/dev/null; then
        log_warning "API $API_ID は既に存在します。スキップします。"
    else
        gcloud api-gateway apis create "$API_ID" \
            --project="$PROJECT_ID"
        log_success "APIが作成されました: $API_ID"
    fi
}

# API設定を作成
create_api_config() {
    log_info "API設定を作成しています: $CONFIG_ID"

    gcloud api-gateway api-configs create "$CONFIG_ID" \
        --api="$API_ID" \
        --openapi-spec=openapi-spec-deploy.yaml \
        --project="$PROJECT_ID" \
        --backend-auth-service-account="$SERVICE_ACCOUNT"

    log_success "API設定が作成されました: $CONFIG_ID（認証なし）"
}

# API Gatewayを作成
create_gateway() {
    log_info "API Gatewayを作成しています: $GATEWAY_ID"

    gcloud api-gateway gateways create "$GATEWAY_ID" \
        --api="$API_ID" \
        --api-config="$CONFIG_ID" \
        --location="$GCP_REGION" \
        --project="$PROJECT_ID"

    log_success "API Gatewayが作成されました: $GATEWAY_ID"
}

# デプロイ状況の確認
check_deployment() {
    log_info "デプロイ状況を確認しています..."

    local gateway_url
    gateway_url=$(gcloud api-gateway gateways describe "$GATEWAY_ID" \
        --location="$GCP_REGION" \
        --project="$PROJECT_ID" \
        --format="value(defaultHostname)")

    log_success "API Gatewayが正常にデプロイされました！"
    log_info "Gateway URL: https://$gateway_url"
    log_info "ヘルスチェック: https://$gateway_url/health"
    log_warning "⚠️  認証なしで誰でもアクセス可能です"

    # 動作確認
    log_info "動作確認を実行しています..."
    if curl -s -f "https://$gateway_url/health" > /dev/null; then
        log_success "ヘルスチェックが正常に動作しています"
    else
        log_warning "ヘルスチェックの動作確認に失敗しました（数分後に再試行してください）"
    fi
}

# クリーンアップ
cleanup() {
    log_info "一時ファイルをクリーンアップしています..."
    rm -f openapi-spec-deploy.yaml
    log_success "クリーンアップが完了しました"
}

# メイン処理
main() {
    log_info "API Gateway デプロイを開始します（認証なし）..."
    log_info "============================================"

    check_env_vars
    check_gcloud_auth
    set_project
    enable_apis
    check_service_account
    update_openapi_spec
    create_api
    create_api_config
    create_gateway
    check_deployment
    cleanup

    log_success "============================================"
    log_success "API Gateway デプロイが完了しました！"
    log_warning "認証が無効になっているため、セキュリティにご注意ください"
}

# スクリプト実行
main "$@"
