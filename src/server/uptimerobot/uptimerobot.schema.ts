import { z } from 'zod'

const logSchema = z.object({
    datetime: z.number(),
    duration: z.number(),
    type: z.number(),
})

const responseTimeSchema = z.object({
    datetime: z.number(),
    value: z.number(),
})

const windowSchema = z.object({
    duration: z.number(),
    friendly_name: z.string().nullish(),
    id: z.number(),
    start_time: z.union([z.number(), z.string()]),
    status: z.number(),
    type: z.number(),
})

const monitorSchema = z.object({
    average_response_time: z.union([z.string(), z.number()]).nullish(),
    create_datetime: z.number(),
    custom_uptime_ranges: z.string(),
    friendly_name: z.string(),
    id: z.number(),
    logs: z.array(logSchema).nullish(),
    mwindows: z.array(windowSchema).nullish(),
    response_times: z.array(responseTimeSchema).nullish(),
    status: z.number(),
})

export const pageSchema = z.object({
    error: z
        .object({
            message: z.string().nullish(),
            parameter_name: z.string().nullish(),
            type: z.string().nullish(),
        })
        .nullish(),
    monitors: z.array(monitorSchema).nullish(),
    pagination: z
        .object({ limit: z.number(), offset: z.number(), total: z.number() })
        .nullish(),
    stat: z.enum(['fail', 'ok']),
})

export interface MonitorQuery {
    logsStart: number
    now: number
    ranges: string
    responseTimesStart: number
}

export type UptimeRobotMonitor = z.input<typeof monitorSchema>
