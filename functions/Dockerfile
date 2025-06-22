# syntax=docker/dockerfile:1

# Node.js 18を使用（Google Cloud RunでサポートされているLTSバージョン）
FROM node:24-bullseye-slim as base

# セキュリティアップデートのためパッケージをアップデート
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    <<EOF
    bash -ex
    apt-get update && \
    apt-get install -y --no-install-recommends \
        tini
    apt-get clean
    rm -rf /var/lib/apt/lists/*
EOF

FROM base as builder
# 作業ディレクトリを設定
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# 依存関係をインストール
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    <<EOF
    bash -ex
    npm i --omit=dev \
    npm cache clean --force
EOF
# アプリケーションコードをコピー
COPY . .

FROM gcr.io/distroless/nodejs24-debian12:latest
WORKDIR /app
ENV TZ=Asia/Tokyo \
    NODE_ENV=production
COPY --from=base /usr/bin/tini /usr/bin/tini
COPY --from=builder --chown=nonnroot:nonnroot /app /app
USER nonroot
# ポート8080をエクスポート（Cloud Runのデフォルト）
EXPOSE 8080
# アプリケーションを起動
ENTRYPOINT [ "/usr/bin/tini", "--" ]
CMD ["/nodejs/bin/node", "app.js"]
