#include "example.h"
#include "redismodule.h"
#include <assert.h>
#include "redistar.h"
#include <string.h>
#include "redistar_memory.h"

int Example_CommandCallback(RedisModuleCtx *ctx, RedisModuleString **argv, int argc){
    RediStarCtx* rsctx = RSM_Load(KeysReader, ctx, RS_STRDUP("*"));
//    RSM_GroupBy(rsctx, KeyRecordStrValueExtractor, NULL, CountReducer, NULL);
    RSM_Write(rsctx, ReplyWriter, NULL);
    return REDISMODULE_OK;
}