import { faAdd } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover"
import { useState } from "react"

function _onChange(filename: string, validators: FormValidator[], setValue: (value: string) => void, setError: (error: string | null) => void) {
    setValue(filename)
    for (const validator of validators) {
        const error = validator(filename)
        if (error) {
            setError(error)
            return
        }
    }
    setError(null)
}

export type FormValidator = (input: string) => string | null
export type FormProps = { onValid: (name: string) => void, validators?: FormValidator[] }

export const NewFileButton = (props: FormProps) => {
    const [error, setError] = useState<string | null>(null)
    const [value, setValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover placement="bottom" showArrow={true} isOpen={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <Button variant='ghost'>
                    <FontAwesomeIcon icon={faAdd} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px]">
                {(titleProps) => (
                    <div className="px-1 py-2 w-full">
                        <p className="text-small font-bold text-foreground" {...titleProps}>
                            New File
                        </p>
                        <div className="mt-2 flex flex-col gap-2 w-full">
                            <Input
                                label="File Name"
                                size="sm"
                                variant="bordered"
                                value={value}
                                isRequired
                                isInvalid={error !== null}
                                errorMessage={error}
                                onValueChange={(v) => _onChange(v, props.validators ?? [], setValue, setError)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && error === null) {
                                        props.onValid(value)
                                        setIsOpen(false)
                                    }
                                    if (e.key === 'Escape') {
                                        setIsOpen(false)
                                    }
                                }} />
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}